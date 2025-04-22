const dynamoDb = require('../../utils/dynamoDb');
const { v4: uuidv4 } = require('uuid');
const { LOCATIONS } = require('../../models/SystemConfig');

/**
 * Creates a new pallet in the database
 * @param {string} codigo - The pallet code
 * @returns {Object} - The created pallet object
 */
async function createPallet(codigo) {
  const now = new Date().toISOString();
  
  const pallet = {
    codigo,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    location: LOCATIONS.PACKING,
    status: 'ACTIVE',
    boxCount: 0,
    boxes: []
  };

  await dynamoDb.put({
    TableName: process.env.PALLETS_TABLE,
    Item: pallet
  });

  return pallet;
}

module.exports = {
  createPallet
}; 