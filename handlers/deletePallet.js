const { deletePalletCascade } = require('../models/pallets'); // <- modelo
const createApiResponse = require('../utils/response');

module.exports = async event => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { codigo } = body || {};

    if (!codigo) return createApiResponse(400, 'Falta el código del pallet');

    const res = await deletePalletCascade(codigo);
    return createApiResponse(res.success ? 200 : 400, res.message, res.data);
  } catch (e) {
    console.error('❌ deletePallet handler:', e);
    return createApiResponse(500, `Error interno: ${e.message}`);
  }
};
