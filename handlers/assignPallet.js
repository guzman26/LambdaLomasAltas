const createApiResponse = require('../utils/response');
const { getOrCreatePallet } = require('../models/pallets');

/**
 * Asigna (o crea) un pallet dado su código.
 * event.body = { codigo: "517251021001", ubicacion?: "BODEGA" }
 */
const assignPalletHandler = async (codigo, ubicacion = 'PACKING') => {
  try {
    if (!codigo) {
      return createApiResponse(400, 'Falta el campo "codigo"');
    }

    const pallet = await getOrCreatePallet(codigo, ubicacion || 'PACKING');
    return createApiResponse(200, '✅ Pallet asignado', pallet);
  } catch (err) {
    console.error('Error en assignPallet:', err);
    return createApiResponse(500, `❌ ${err.message}`);
  }
};

module.exports = assignPalletHandler;
