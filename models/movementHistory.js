// models/movementHistory.js
const { dynamoDB, Tables } = require('./index');

const tableName = Tables.MovementHistory;

/**
 * Record a movement event for a box or pallet
 * @param {string} itemCode - Box or pallet code 
 * @param {string} itemType - BOX or PALLET
 * @param {string} fromLocation - Previous location
 * @param {string} toLocation - New location
 * @param {string} userId - Optional user ID who performed the action
 * @returns {Promise<Object>} The created history record
 */
async function recordMovement(itemCode, itemType, fromLocation, toLocation, userId = 'system') {
  if (!itemCode || !fromLocation || !toLocation) {
    throw new Error('itemCode, fromLocation, and toLocation are required');
  }
  
  if (!['BOX', 'PALLET'].includes(itemType)) {
    throw new Error('itemType must be BOX or PALLET');
  }
  
  const timestamp = new Date().toISOString();
  const id = require('uuid').v4();
  
  const movementRecord = {
    id,
    codigo,
    itemType,
    fromLocation,
    toLocation,
    timestamp,
    userId
  };
  
  try {
    await dynamoDB.put({
      TableName: tableName,
      Item: movementRecord
    }).promise();
    
    return movementRecord;
  } catch (error) {
    console.error(`Error recording movement for ${itemType} ${itemCode}:`, error);
    throw new Error(`Error recording movement: ${error.message}`);
  }
}

/**
 * Get movement history for a specific item
 * @param {string} itemCode - Box or pallet code
 * @returns {Promise<Array>} Movement history records
 */
async function getMovementsByItemCode(itemCode) {
  if (!itemCode) {
    throw new Error('itemCode is required');
  }
  
  try {
    const params = {
      TableName: tableName,
      IndexName: 'codigo-timestamp-index',
      KeyConditionExpression: 'codigo = :code',
      ExpressionAttributeValues: {
        ':code': itemCode
      },
      ScanIndexForward: false // Most recent first
    };
    
    const result = await dynamoDB.query(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error(`Error getting movement history for ${itemCode}:`, error);
    throw new Error(`Error getting movement history: ${error.message}`);
  }
}

/**
 * Get all movements within a date range
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {Promise<Array>} Movement history records
 */
async function getMovementsByDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error('startDate and endDate are required');
  }
  
  try {
    const params = {
      TableName: tableName,
      IndexName: 'timestamp-index',
      KeyConditionExpression: 'timestamp BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':start': startDate,
        ':end': endDate
      }
    };
    
    const result = await dynamoDB.query(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error(`Error getting movements between ${startDate} and ${endDate}:`, error);
    throw new Error(`Error getting movements by date range: ${error.message}`);
  }
}

module.exports = {
  recordMovement,
  getMovementsByItemCode,
  getMovementsByDateRange
}; 