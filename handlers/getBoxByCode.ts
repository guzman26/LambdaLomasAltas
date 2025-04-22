import AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const BOXES_TABLE = "Boxes";

/**
 * Gets a box by its unique code
 * @param {string} code - The box code
 * @returns {Promise<object>} - The response object
 */
const getBoxByCode = async (code: string) => {
  try {
    const { Item } = await dynamoDB.get({
      TableName: BOXES_TABLE,
      Key: { codigo: code }
    }).promise();
    
    if (!Item) {
      return { success: false, message: `No box found with code ${code}` };
    }
    
    return { success: true, data: Item };
  } catch (error: any) {
    console.error(`Error retrieving box with code ${code}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = getBoxByCode;
