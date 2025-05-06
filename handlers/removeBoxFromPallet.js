/* ---------- imports de modelos, nada de DynamoDB directo ---------- */
const {
  getPalletByCode,
  updatePalletBoxes, // util que ya expone tu modelo de pallets
} = require('../models/pallets');

const { getBoxByCode, updateBox } = require('../models/boxes');

/**
 * Remueve una caja de un pallet:
 *   • El pallet debe existir y estar 'open'
 *   • La caja debe existir y pertenecer a ese pallet
 *   • Devuelve { updatedPallet, updatedBox }
 */
const removeBoxFromPallet = async (palletId, boxCode) => {
  /* 1️⃣  Leer y validar pallet -------------------------------------------- */
  const pallet = await getPalletByCode(palletId);
  if (!pallet) throw new Error(`Pallet "${palletId}" no existe`);

  // CUESTIONAR: ¿Por qué no se valida que el pallet esté abierto?
  // if (pallet.estado !== 'open')
  //   throw new Error(`Pallet "${palletId}" no está abierto`);

  /* 2️⃣  Leer y validar box ------------------------------------------------ */
  const box = await getBoxByCode(boxCode);
  if (!box) throw new Error(`Caja "${boxCode}" no existe`);
  if (box.palletId !== palletId)
    throw new Error(`Caja "${boxCode}" no pertenece al pallet "${palletId}"`);

  /* 3️⃣  Actualizar pallet (quita la caja y decrementa contador) ----------- */
  const nuevasCajas = (pallet.cajas || []).filter(c => c !== boxCode);
  const updatedPallet = await updatePalletBoxes(palletId, nuevasCajas);

  /* 4️⃣  Actualizar box: quitamos palletId y movemos a PACKING ------------- */
  const updatedBox = await updateBox(boxCode, {
    palletId: 'UNASSIGNED',
    ubicacion: 'PACKING',
  });

  return { updatedPallet, updatedBox };
};

module.exports = removeBoxFromPallet;
