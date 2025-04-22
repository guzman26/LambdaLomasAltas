const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Creates a new egg record in the database
 * 
 * @param {Object} eggData - The egg data to be created
 * @returns {Promise<Object>} - The created egg data
 */
const createEgg = async (eggData) => {
  try {
    // Generate a unique ID or use one provided in eggData
    const item = {
      ...eggData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: process.env.EGGS_TABLE_NAME || 'Eggs',
      Item: item
    };

    await dynamoDB.put(params).promise();
    return item;
  } catch (error) {
    console.error('Error creating egg:', error);
    throw error;
  }
};

module.exports = createEgg; 