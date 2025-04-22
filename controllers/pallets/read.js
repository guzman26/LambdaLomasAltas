const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const Pallet = require('../../models/Pallet');
const dbUtils = require('../../utils/db');
const createApiResponse = require('../../utils/response');

/**
 * Get all pallets
 * @returns {Promise<Object>} API response
 */
async function getAllPallets() {
  try {
    const pallets = await dbUtils.scanItems(Pallet.getTableName());
    return createApiResponse(200, "Pallets retrieved successfully", pallets);
  } catch (error) {
    console.error("❌ Error retrieving pallets:", error);
    return createApiResponse(500, `Error retrieving pallets: ${error.message}`);
  }
}

/**
 * Get active pallets
 * @returns {Promise<Object>} API response
 */
async function getActivePallets() {
  try {
    const pallets = await dbUtils.scanItems(
      Pallet.getTableName(),
      'attribute_not_exists(fechaCierre)'
    );
    return createApiResponse(200, "Active pallets retrieved successfully", pallets);
  } catch (error) {
    console.error("❌ Error retrieving active pallets:", error);
    return createApiResponse(500, `Error retrieving active pallets: ${error.message}`);
  }
}

/**
 * Get closed pallets
 * @param {string} location - Optional location filter
 * @returns {Promise<Object>} API response
 */
async function getClosedPallets(location = null) {
  try {
    let filterExpression = 'attribute_exists(fechaCierre)';
    let expressionAttributeValues = null;
    
    if (location) {
      filterExpression += ' AND ubicacion = :location';
      expressionAttributeValues = { ':location': location };
    }
    
    const pallets = await dbUtils.scanItems(
      Pallet.getTableName(),
      filterExpression,
      expressionAttributeValues
    );
    
    return createApiResponse(200, "Closed pallets retrieved successfully", pallets);
  } catch (error) {
    console.error("❌ Error retrieving closed pallets:", error);
    return createApiResponse(500, `Error retrieving closed pallets: ${error.message}`);
  }
}

/**
 * Get pallet by code
 * @param {string} code - Pallet code
 * @returns {Promise<Object>} API response
 */
async function getPalletByCode(code) {
  try {
    const pallet = await dbUtils.getItem(Pallet.getTableName(), { codigo: code });
    if (!pallet) {
      return createApiResponse(404, `Pallet with code ${code} not found`);
    }
    return createApiResponse(200, "Pallet retrieved successfully", pallet);
  } catch (error) {
    console.error(`❌ Error retrieving pallet ${code}:`, error);
    return createApiResponse(500, `Error retrieving pallet: ${error.message}`);
  }
}

/**
 * Get boxes in a pallet
 * @param {string} palletCode - Pallet code
 * @returns {Promise<Object>} API response
 */
async function getBoxesInPallet(palletCode) {
  try {
    const pallet = await dbUtils.getItem(Pallet.getTableName(), { codigo: palletCode });
    if (!pallet) {
      return createApiResponse(404, `Pallet with code ${palletCode} not found`);
    }
    
    return createApiResponse(200, "Boxes in pallet retrieved successfully", {
      pallet: palletCode,
      boxCount: pallet.cantidadCajas || 0,
      boxes: pallet.cajas || []
    });
  } catch (error) {
    console.error(`❌ Error retrieving boxes in pallet ${palletCode}:`, error);
    return createApiResponse(500, `Error retrieving boxes in pallet: ${error.message}`);
  }
}

module.exports = {
  getAllPallets,
  getActivePallets,
  getClosedPallets,
  getPalletByCode,
  getBoxesInPallet
}; 