const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const Box = require('../../models/Box');
const SystemConfig = require('../../models/SystemConfig');
const dbUtils = require('../../utils/db');
const createApiResponse = require('../../utils/response');

/**
 * Get a box by its code
 * @param {string} code - Box code
 * @returns {Promise<Object>} API response
 */
async function getBoxByCode(code) {
  try {
    const box = await dbUtils.getItem(Box.getTableName(), { codigo: code });
    if (!box) {
      return createApiResponse(404, `Box with code ${code} not found`);
    }
    return createApiResponse(200, "Box data fetched successfully", box);
  } catch (error) {
    console.error(`❌ Error retrieving box ${code}:`, error);
    return createApiResponse(500, `Error retrieving box: ${error.message}`);
  }
}

async function getBoxesByLocation(location) {
  try {
    const boxes = await dbUtils.scanItems(
      Box.getTableName(),
      'ubicacion = :location',
      { ':location': location }
    );
    return createApiResponse(200, "Boxes fetched successfully", boxes);
  } catch (error) {
    console.error('❌ Error retrieving boxes by location:', error);
    return createApiResponse(500, `Error retrieving boxes: ${error.message}`);
  }
}


/**
 * Get unassigned boxes in packing
 * @returns {Promise<Object>} API response
 */
async function getUnassignedBoxesInPacking() {
  try {
    const boxes = await dbUtils.scanItems(
      Box.getTableName(),
      'ubicacion = :location AND attribute_not_exists(palletId)',
      { ':location': SystemConfig.getLocations().PACKING }
    );
    return createApiResponse(200, "Unassigned boxes in packing fetched successfully", boxes);
  } catch (error) {
    console.error('❌ Error retrieving unassigned boxes in packing:', error);
    return createApiResponse(500, `Error retrieving unassigned boxes: ${error.message}`);
  }
}

module.exports = {
  getBoxByCode,
  getUnassignedBoxesInPacking,
  getBoxesByLocation
}; 