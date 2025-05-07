const { getPalletByCode, movePalletWithBoxes } = require('../models/pallets');
const { recordMovement } = require('../models/movementHistory');
const createApiResponse = require('../utils/response');

/* helpers */
const isValidPalletCode = c => /^\d{12}$/.test(c);
const DESTS = ['TRANSITO', 'BODEGA', 'VENTA'];

async function movePallet(codigo, destino) {
  /* 1) validaciones */
  if (!isValidPalletCode(codigo))
    return createApiResponse(400, `Código de pallet inválido: ${codigo} (12 dígitos).`);

  if (!DESTS.includes(destino)) return createApiResponse(400, `Destino inválido: ${destino}.`);

  try {
    const pallet = await getPalletByCode(codigo);
    if (!pallet) return createApiResponse(404, `El pallet ${codigo} no existe.`);

    if (pallet.ubicacion === destino)
      return createApiResponse(400, `El pallet ${codigo} ya se encuentra en ${destino}.`);

    const fromLocation = pallet.ubicacion;
    
    const { boxesUpdated } = await movePalletWithBoxes(codigo, destino);
    
    // Record pallet movement in history
    // await recordMovement(codigo, 'PALLET', fromLocation, destino);

    return createApiResponse(
      200,
      `Pallet ${codigo} movido a ${destino} con ${boxesUpdated} cajas.`,
      { boxesUpdated }
    );
  } catch (err) {
    console.error('❌ Error moviendo pallet:', err);
    return createApiResponse(500, `Error al mover pallet: ${err.message}`);
  }
}

module.exports = { movePallet };
