const getBoxes = require('./getBoxes');
const response = require('../utils/response');
const { getBoxesByLocation } = require('../models/boxes');

module.exports = async () => {
  try {
    const eggs = await getBoxesByLocation('PACKING');
    return response(200, eggs);
  } catch (error) {
    return response(500, 'Error al obtener huevos en PACKING', { error: error.message });
  }
};
