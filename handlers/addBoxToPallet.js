// handlers/addBoxToPallet.js
const createApiResponse = require('../utils/response');
const { addBoxToPallet } = require('../models/pallets');

const addBoxToPalletHandler = async (palletId, boxCode) => {
  try {
    if (!palletId || !boxCode) {
      return createApiResponse(400, 'Faltan palletId o boxCode');
    }

    const pallet = await addBoxToPallet(palletId, boxCode);
    return createApiResponse(200, '✅ Caja asignada', pallet);
  } catch (err) {
    console.error('Error addBoxToPallet:', err);
    return createApiResponse(400, `❌ ${err.message}`);
  }
};

module.exports = addBoxToPalletHandler;
