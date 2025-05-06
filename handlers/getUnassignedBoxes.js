const { findBoxesWithoutPallet } = require('../models/boxes');
const createApiResponse = require('../utils/response');

const getUnassignedBoxes = async () => {
  try {
    const boxes = await findBoxesWithoutPallet();
    return createApiResponse(200, boxes);
  } catch (err) {
    console.error('❌ Error getUnassignedBoxes:', err);
    return createApiResponse(500, err.message);
  }
};

module.exports = getUnassignedBoxes;
