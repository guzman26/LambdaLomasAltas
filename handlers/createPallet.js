// handlers/createPallet.js
const createApiResponse      = require('../utils/response');
const { createPallet }       = require('../models/pallets');

const createPalletHandler = async (codigo) => {
  try {

    if (!codigo) {
      return createApiResponse(400, '⚠️ Falta baseCode (9 dígitos)');
    }

    const pallet = await createPallet(codigo);
    return createApiResponse(201, '✅ Pallet creado', pallet);

  } catch (err) {
    console.error('❌ Error createPallet:', err);
    const status = err.message.includes('baseCode') ? 400 : 500;
    return createApiResponse(status, `❌ ${err.message}`);
  }
};

module.exports = createPalletHandler;