const { getPallets } = require('../models/pallets');
const createApiResponse = require('../utils/response');

const getPalletsHandler = async event => {
  try {
    const { estado, ubicacion, fechaDesde, fechaHasta } = event.queryStringParameters || {};
    const pallets = await getPallets({ estado, ubicacion, fechaDesde, fechaHasta });
    return createApiResponse(200, 'Pallets fetched successfully', pallets);
  } catch (err) {
    console.error('Error al obtener pallets:', err);
    return createApiResponse(400, err.message); // 400 si es falta de filtros, 500 si lo prefieres
  }
};

module.exports = getPalletsHandler;
