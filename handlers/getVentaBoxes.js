const { getBoxesByLocation } = require('../models/boxes');
const response = require('../utils/response');

const getVentaBoxesHandler = async () => {
  try {
    const boxes = await getBoxesByLocation('VENTA');
    return response(200, boxes);
  } catch (error) {
    return response(500, 'Error al obtener huevos en VENTA', { error: error.message });
  }
};

module.exports = getVentaBoxesHandler;
