const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Deletes a box record from the database
 * 
 * @param {string} codigo - The codigo of the box to delete
 * @returns {Promise<Object>} - The deletion result
 */
const deleteBox = async (codigo) => {
  try {
    const params = {
      TableName: process.env.BOXES_TABLE_NAME || 'Boxes',
      Key: { codigo: codigo },
      ReturnValues: 'ALL_OLD'
    };

    const result = await dynamoDB.delete(params).promise();
    return result.Attributes;
  } catch (error) {
    console.error('Error deleting box:', error);
    throw error;
  }
};

module.exports = deleteBox; 