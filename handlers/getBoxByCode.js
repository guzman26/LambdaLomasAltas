const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const BOXES_TABLE = "Boxes";

/**
 * Gets a box by its unique code
 * @param {string} code - The box code
 * @returns {Promise<object>} - The response object
 */
const getBoxByCode = async (code) => {
  try {
    const { Item } = await dynamoDB.get({
      TableName: BOXES_TABLE,
      Key: { codigo: code }
    }).promise();
    
    if (!Item) {
      return { success: false, message: `No box found with code ${code}` };
    }
    
    return { success: true, data: Item };
  } catch (error) {
    console.error(`Error retrieving box with code ${code}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = getBoxByCode;
