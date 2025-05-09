const { dynamoDB, Tables } = require('../models/index');
const createApiResponse = require('../utils/response');

/**
 * Get history of movements for a specific box or pallet
 * @param {string} codigo - Box or pallet code
 * @param {string} itemType - 'BOX' or 'PALLET'
 * @returns {Promise<Array>} Movement history
 */
async function getItemHistory(codigo, itemType) {
  if (!codigo) {
    throw new Error('Code is required');
  }

  if (!['BOX', 'PALLET'].includes(itemType)) {
    throw new Error('Item type must be BOX or PALLET');
  }

  const tableName = itemType === 'BOX' ? Tables.Boxes : Tables.Pallets;

  try {
    // Get the current item data
    const params = {
      TableName: tableName,
      Key: { codigo },
    };

    const result = await dynamoDB.get(params).promise();

    if (!result.Item) {
      throw new Error(`${itemType} with code ${codigo} not found`);
    }

    // Get movement logs from the history table
    const historyParams = {
      TableName: Tables.MovementHistory,
      IndexName: 'codigo-timestamp-index',
      KeyConditionExpression: 'codigo = :code',
      ExpressionAttributeValues: {
        ':code': codigo,
      },
      ScanIndexForward: false, // Most recent first
    };

    const historyResult = await dynamoDB.query(historyParams).promise();

    return {
      item: result.Item,
      movements: historyResult.Items || [],
    };
  } catch (error) {
    console.error(`Error getting history for ${itemType} ${codigo}:`, error);
    throw new Error(`Error getting history: ${error.message}`);
  }
}

async function getItemHistoryHandler(event) {
  try {
    const { codigo, itemType } = event.queryStringParameters || {};

    if (!codigo || !itemType) {
      return createApiResponse(400, 'Missing required parameters: codigo and itemType', null);
    }

    const result = await getItemHistory(codigo, itemType);
    return createApiResponse(200, `${itemType} history fetched successfully`, result);
  } catch (error) {
    console.error('Error in getItemHistoryHandler:', error);
    return createApiResponse(500, error.message);
  }
}

module.exports = getItemHistoryHandler;
