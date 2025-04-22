const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Creates a new box record in the database
 * 
 * @param {Object} boxData - The box data to be created
 * @returns {Promise<Object>} - The created box data
 */
const createBox = async (boxData) => {
  try {
    // Generate a unique ID or use one provided in boxData
    const item = {
      ...boxData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: process.env.BOXES_TABLE_NAME || 'Boxes',
      Item: item
    };

    await dynamoDB.put(params).promise();
    return item;
  } catch (error) {
    console.error('Error creating box:', error);
    throw error;
  }
};

module.exports = createBox; 