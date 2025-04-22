const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Deletes an egg record from the database
 * 
 * @param {string} eggId - The ID of the egg to delete
 * @returns {Promise<Object>} - The deletion result
 */
const deleteEgg = async (eggId) => {
  try {
    const params = {
      TableName: process.env.EGGS_TABLE_NAME || 'Eggs',
      Key: { id: eggId },
      ReturnValues: 'ALL_OLD'
    };

    const result = await dynamoDB.delete(params).promise();
    return result.Attributes;
  } catch (error) {
    console.error('Error deleting egg:', error);
    throw error;
  }
};

module.exports = deleteEgg; 