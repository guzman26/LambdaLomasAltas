const { togglePalletStatus } = require('../models/pallets');
const createApiResponse = require('../utils/response');

const closePalletHandler = async codigo => {
  const pallet = await togglePalletStatus(codigo);
  return createApiResponse(200, 'Pallet actualizado', pallet);
};

module.exports = closePalletHandler;
