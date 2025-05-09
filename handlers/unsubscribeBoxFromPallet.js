const createApiResponse = require('../utils/response');
const { unsubscribeBoxFromPallet } = require('../models/boxes');

const unsubscribeBoxFromPalletHandler = async (palletId, boxCode) => {
  try {
    if (!palletId || !boxCode) {
      return createApiResponse(400, 'Faltan palletId o boxCode');
    }

    const result = await unsubscribeBoxFromPallet(boxCode, palletId);
    return createApiResponse(200, '✅ Caja desasignada del pallet', result);
  } catch (err) {
    console.error('Error unsubscribeBoxFromPallet:', err);
    return createApiResponse(400, `❌ ${err.message}`);
  }
};

module.exports = unsubscribeBoxFromPalletHandler; 