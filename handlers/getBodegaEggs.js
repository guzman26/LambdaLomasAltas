const createApiResponse = require('../utils/response');
const { getBoxesByLocation } = require('../models/boxes');

/**
 * Retrieves all eggs stored in the BODEGA location
 * @returns {Object} API response with eggs data
 */
module.exports = async () => {
  try {
    console.log('🔍 Fetching eggs from BODEGA...');
    const eggs = await getBoxesByLocation('BODEGA');

    console.log(`📦 Retrieved ${eggs.length} eggs from BODEGA`);
    return createApiResponse(200, eggs);
  } catch (error) {
    console.error('❌ Error fetching eggs from BODEGA:', error);
    return createApiResponse(500, 'Error retrieving eggs from BODEGA', { error: error.message });
  }
};
