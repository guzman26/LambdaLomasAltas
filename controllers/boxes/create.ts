import AWS from 'aws-sdk';
import { DynamoDbItem } from '../../types';
import type { Box } from '../../types';
import BoxModel from '../../models/Box';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Creates a new box record in the database
 * 
 * @param {Object} boxData - The box data to be created
 * @returns {Promise<Box>} - The created box data
 */
const createBox = async (boxData: Partial<Box>): Promise<Box> => {
  try {
    // Generate a unique ID or use one provided in boxData
    const item: DynamoDbItem = {
      ...boxData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: BoxModel.getTableName(),
      Item: item
    };

    await dynamoDB.put(params).promise();
    return item as Box;
  } catch (error) {
    console.error('Error creating box:', error);
    throw error;
  }
};

export default createBox; 