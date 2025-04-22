const dynamoDb = require('../../utils/dynamoDb');

/**
 * Updates a pallet's location
 * @param {string} codigo - The pallet code
 * @param {string} location - The new location
 * @returns {Object} - The updated pallet
 */
async function updatePalletLocation(codigo, location) {
  const now = new Date().toISOString();
  
  const params = {
    TableName: process.env.PALLETS_TABLE,
    Key: { codigo },
    UpdateExpression: 'set #location = :location, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#location': 'location'
    },
    ExpressionAttributeValues: {
      ':location': location,
      ':updatedAt': now
    },
    ReturnValues: 'ALL_NEW'
  };

  const { Attributes } = await dynamoDb.update(params);
  return Attributes;
}

/**
 * Updates a pallet's status
 * @param {string} codigo - The pallet code
 * @param {string} status - The new status (ACTIVE or CLOSED)
 * @returns {Object} - The updated pallet
 */
async function updatePalletStatus(codigo, status) {
  const now = new Date().toISOString();
  
  const params = {
    TableName: process.env.PALLETS_TABLE,
    Key: { codigo },
    UpdateExpression: 'set #status = :status, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': now
    },
    ReturnValues: 'ALL_NEW'
  };

  const { Attributes } = await dynamoDb.update(params);
  return Attributes;
}

/**
 * Adds a box to a pallet
 * @param {string} palletCodigo - The pallet code
 * @param {string} boxCodigo - The box code to add
 * @returns {Object} - The updated pallet
 */
async function addBoxToPallet(palletCodigo, boxCodigo) {
  const now = new Date().toISOString();
  
  const params = {
    TableName: process.env.PALLETS_TABLE,
    Key: { codigo: palletCodigo },
    UpdateExpression: 'set boxes = list_append(if_not_exists(boxes, :empty_list), :box), boxCount = boxCount + :inc, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':box': [boxCodigo],
      ':empty_list': [],
      ':inc': 1,
      ':updatedAt': now
    },
    ReturnValues: 'ALL_NEW'
  };

  const { Attributes } = await dynamoDb.update(params);
  return Attributes;
}

module.exports = {
  updatePalletLocation,
  updatePalletStatus,
  addBoxToPallet
}; 