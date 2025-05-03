const { getUnassignedBoxesInPacking } = require('../models/boxes');
const createApiResponse               = require('../utils/response');

const getUnassignedBoxesInPackingHandler = async () => {
  try {
    const boxes = await getUnassignedBoxesInPacking();
    return createApiResponse(200, boxes);
  } catch (err) {
    console.error('❌ Error getUnassignedBoxesInPacking:', err);
    return createApiResponse(500, err.message);
  }
};

module.exports = getUnassignedBoxesInPackingHandler;
