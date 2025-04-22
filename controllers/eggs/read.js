const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const Egg = require('../../models/Egg');
const dbUtils = require('../../utils/db');
const createApiResponse = require('../../utils/response');

/**
 * Get all eggs
 * @returns {Promise<Object>} API response
 */
async function getAllEggs() {
  try {
    const eggs = await dbUtils.scanItems(Egg.getTableName());
    return createApiResponse(200, "Eggs retrieved successfully", eggs);
  } catch (error) {
    console.error("❌ Error retrieving eggs:", error);
    return createApiResponse(500, `Error retrieving eggs: ${error.message}`);
  }
}

/**
 * Get eggs by location
 * @param {string} location - Location
 * @returns {Promise<Object>} API response
 */
async function getEggsByLocation(location) {
  try {
    const eggs = await dbUtils.queryItems(
      Egg.getTableName(),
      '#ubicacion = :locationValue',
      { ':locationValue': location },
      { '#ubicacion': 'ubicacion' },
      'ubicacion-index'
    );
    return createApiResponse(200, `Eggs in ${location} retrieved successfully`, eggs);
  } catch (error) {
    console.error(`❌ Error retrieving eggs from ${location}:`, error);
    return createApiResponse(500, `Error retrieving eggs from ${location}: ${error.message}`);
  }
}

/**
 * Get eggs by code
 * @param {string} code - Egg code
 * @returns {Promise<Object>} API response
 */
async function getEggByCode(code) {
  try {
    const egg = await dbUtils.getItem(Egg.getTableName(), { codigo: code });
    if (!egg) {
      return createApiResponse(404, `Egg with code ${code} not found`);
    }
    return createApiResponse(200, "Egg retrieved successfully", egg);
  } catch (error) {
    console.error(`❌ Error retrieving egg ${code}:`, error);
    return createApiResponse(500, `Error retrieving egg: ${error.message}`);
  }
}

/**
 * Get eggs by date
 * @param {string} date - Date
 * @returns {Promise<Object>} API response
 */
async function getEggsByDate(date) {
  try {
    const eggs = await dbUtils.scanItems(
      Egg.getTableName(),
      'begins_with(fecha_registro, :datePrefix)',
      { ':datePrefix': date }
    );
    return createApiResponse(200, `Eggs for date ${date} retrieved successfully`, eggs);
  } catch (error) {
    console.error(`❌ Error retrieving eggs for date ${date}:`, error);
    return createApiResponse(500, `Error retrieving eggs by date: ${error.message}`);
  }
}

module.exports = {
  getAllEggs,
  getEggsByLocation,
  getEggByCode,
  getEggsByDate
}; 