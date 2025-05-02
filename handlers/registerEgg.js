/* ---------- imports de modelos, nada de DynamoDB directo ---------- */
const {
  createBox,
  getBoxByCode,
  boxExists,
  assignBoxToPallet,
} = require('../models/boxes');

const {
  getPallets,          // ya filtra por estado / ubicación a través del GSI
  getPalletByCode,
  getOrCreatePallet,   // crea si no existe (con la lógica de suffix)
  addBoxToPallet,      // usa TransactWriteItems: la caja SIEMPRE queda registrada
} = require('../models/pallets');

const { parseBoxCode }    = require('../utils/parseBoxCode');
const { parsePalletCode } = require('../utils/parsePalletCode');
const createApiResponse   = require('../utils/response');

/* ---------- memoria anti-rebote ---------- */
const recentlyProcessedBoxes = new Map();
const PROCESSING_COOLDOWN    = 2_000;   // 2 s

setInterval(() => {
  const now = Date.now();
  for (const [c, t] of recentlyProcessedBoxes)
    if (now - t > 10_000) recentlyProcessedBoxes.delete(c);
}, 60_000);

/* ---------- util para buscar pallet “open / PACKING / calibre” ------- */
async function findMatchingPallet(boxData) {
  const pallets = await getPallets({ estado: 'open', ubicacion: 'PACKING' });

  const pallet = pallets.find(p => {
    const { calibre } = parsePalletCode(p.codigo);
    return calibre === boxData.calibre && p.cantidadCajas < 60;
  });

  if (!pallet) throw new Error('No hay pallet compatible en PACKING');
  return pallet;
}

/* =================================================================== */
/* =========================  REGISTER EGG  ========================== */
/* =================================================================== */
module.exports = async function registerEgg(
  codigoCaja,
  _unused,
  palletCodeFromClient,
  scannedCodes
) {
  /* 0️⃣  anti-rebote --------------------------------------------------*/
  const now = Date.now();
  if (recentlyProcessedBoxes.get(codigoCaja) &&
      now - recentlyProcessedBoxes.get(codigoCaja) < PROCESSING_COOLDOWN) {

    const repetida = await getBoxByCode(codigoCaja);
    if (repetida)
      return createApiResponse(200, '✅ Caja ya registrada', repetida);
  }
  recentlyProcessedBoxes.set(codigoCaja, now);

  /* 1️⃣  Parsear código de caja --------------------------------------*/
  let parsed;
  try {
    parsed = parseBoxCode(codigoCaja);
  } catch (err) {
    return createApiResponse(400, `❌ Código inválido: ${err.message}`);
  }

  /* 2️⃣  Construir objeto caja y grabar ------------------------------*/
  const boxItem = {
    codigo       : codigoCaja,
    ...parsed,
    palletId     : 'UNASSIGNED',
    fecha_registro : new Date().toISOString(),
    estado       : 'PACKING',
    ubicacion    : 'PACKING',
    ...(scannedCodes && { scannedCodes: JSON.stringify(scannedCodes) }),
  };

  try { await createBox(boxItem); }
  catch (e) {
    return createApiResponse(500, `❌ Error guardando caja: ${e.message}`);
  }

  /* 3️⃣  Determinar pallet destino -----------------------------------*/
  let palletCode = palletCodeFromClient;

  try {
    if (!palletCode) {
      const pallet = await findMatchingPallet(boxItem);
      palletCode = pallet.codigo;
    }

    /* 4️⃣  Asegurar que el pallet existe y está abierto --------------*/
    const pallet = await getOrCreatePallet(palletCode, 'PACKING');

    /* 5️⃣  Añadir caja al pallet (transacción atómica) ---------------*/
    const updatedPallet = await addBoxToPallet(pallet.codigo, boxItem.codigo);

    return createApiResponse(
      200,
      `✅ Caja asignada al pallet ${updatedPallet.codigo}`,
      { ...boxItem, palletId: updatedPallet.codigo }
    );
  } catch (err) {
    return createApiResponse(
      400,
      `⚠️ Caja registrada pero no pudo ser asignada: ${err.message}`,
      boxItem
    );
  }
};
