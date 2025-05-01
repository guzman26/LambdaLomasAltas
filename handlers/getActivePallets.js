const { getOpenPallets } = require('../models/pallets');
const createApiResponse = require('../utils/response');

const getActivePalletsHandler = async () => {
  try {
    const pallets = await getOpenPallets();
    return createApiResponse(200, `✅ Found ${pallets.length} open pallet(s)`, pallets);
  } catch (err) {
    console.error('Error al obtener pallets abiertos:', err);
    return createApiResponse(500, `❌ Error fetching open pallets: ${err.message}`);
  }
};

module.exports = getActivePalletsHandler;
