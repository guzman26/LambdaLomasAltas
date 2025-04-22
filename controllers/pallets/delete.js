const dynamoDb = require('../../utils/dynamoDb');

/**
 * Deletes a pallet from the database
 * @param {string} codigo - The pallet code to delete
 * @returns {Object} - Result of the deletion operation
 */
async function deletePallet(codigo) {
  // Check if pallet exists
  const { Item: pallet } = await dynamoDb.get({
    TableName: process.env.PALLETS_TABLE,
    Key: { codigo }
  });

  if (!pallet) {
    throw new Error(`Pallet with codigo ${codigo} not found`);
  }

  // Check if pallet has boxes
  if (pallet.boxes && pallet.boxes.length > 0) {
    throw new Error(`Cannot delete pallet ${codigo} because it contains ${pallet.boxes.length} boxes`);
  }

  // Delete the pallet
  await dynamoDb.delete({
    TableName: process.env.PALLETS_TABLE,
    Key: { codigo }
  });

  return {
    success: true,
    message: `Pallet ${codigo} has been deleted successfully`
  };
}

module.exports = deletePallet; 