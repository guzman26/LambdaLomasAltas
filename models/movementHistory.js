// models/movementHistory.js
const { dynamoDB, Tables } = require('./index');
const { handleDynamoDBError, validateRequiredParams } = require('../utils/dynamoErrors');

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
async function recordMovement(codigo, itemType, fromLocation, toLocation, userId = 'system') {
  try {
    validateRequiredParams(
      { codigo, itemType, fromLocation, toLocation },
      ['codigo', 'itemType', 'fromLocation', 'toLocation']
    );
    
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
    
    await dynamoDB.put({
      TableName: tableName,
      Item: movementRecord
    }).promise();
    
    return movementRecord;
  } catch (error) {
    if (error.message.includes('Parámetros requeridos') || 
        error.message.includes('itemType must be')) {
      throw error;
    }
    throw handleDynamoDBError(error, 'registrar', 'movimiento', codigo);
  }
}

/**
 * Register a movement event with extended metadata
 * @param {Object} moveData - Movement data
 * @param {string} moveData.codigo - Box or pallet code
 * @param {string} moveData.itemType - BOX or PALLET
 * @param {string} moveData.destino - New location
 * @param {string} [moveData.origen] - Previous location (optional)
 * @param {string} [moveData.usuario] - User who performed the action
 * @param {string} [moveData.timestamp] - Timestamp of the action
 * @param {Object} [moveData.metadata] - Additional metadata
 * @returns {Promise<Object>} The created history record
 */
async function registerMovement(moveData) {
  try {
    validateRequiredParams(moveData, ['codigo', 'itemType', 'destino']);
    
    if (!['BOX', 'PALLET'].includes(moveData.itemType)) {
      throw new Error('itemType debe ser BOX o PALLET');
    }
    
    const timestamp = moveData.timestamp || new Date().toISOString();
    const id = require('uuid').v4();
    
    const movementRecord = {
      id,
      codigo: moveData.codigo,
      itemType: moveData.itemType,
      fromLocation: moveData.origen || 'UNKNOWN',
      toLocation: moveData.destino,
      timestamp,
      userId: moveData.usuario || 'system',
      metadata: moveData.metadata || {}
    };
    
    await dynamoDB.put({
      TableName: tableName,
      Item: movementRecord
    }).promise();
    
    return movementRecord;
  } catch (error) {
    if (error.message.includes('Parámetros requeridos') || 
        error.message.includes('itemType debe ser')) {
      throw error;
    }
    throw handleDynamoDBError(error, 'registrar', 'movimiento', moveData?.codigo);
  }
}

/**
 * Get movement history for a specific item
 * @param {string} itemCode - Box or pallet code
 * @returns {Promise<Array>} Movement history records
 */
async function getMovementsByItemCode(itemCode) {
  try {
    validateRequiredParams({ itemCode }, ['itemCode']);
    
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
    if (error.message.includes('Parámetros requeridos')) {
      throw error;
    }
    throw handleDynamoDBError(error, 'consultar', 'historial de movimientos', itemCode);
  }
}

/**
 * Get all movements within a date range
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {Promise<Array>} Movement history records
 */
async function getMovementsByDateRange(startDate, endDate) {
  try {
    validateRequiredParams({ startDate, endDate }, ['startDate', 'endDate']);
    
    // Validate date format
    if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
      throw new Error('Las fechas deben estar en formato ISO (YYYY-MM-DDTHH:MM:SS.sssZ)');
    }
    
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
    if (error.message.includes('Parámetros requeridos') || 
        error.message.includes('Las fechas deben estar')) {
      throw error;
    }
    throw handleDynamoDBError(error, 'consultar', 'movimientos por rango de fechas', `${startDate} a ${endDate}`);
  }
}

module.exports = {
  recordMovement,
  registerMovement,
  getMovementsByItemCode,
  getMovementsByDateRange
}; 