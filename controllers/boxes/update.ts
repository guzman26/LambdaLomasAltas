import AWS from 'aws-sdk';
import type { Box } from '../../types';
import BoxModel from '../../models/Box';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Updates an existing box record in the database
 * 
 * @param {string} codigo - The codigo of the box to update
 * @param {Partial<Box>} updateData - The box data to be updated
 * @returns {Promise<Box>} - The updated box data
 */
const updateBox = async (codigo: string, updateData: Partial<Box>): Promise<Box> => {
  try {
    // Create update expression and attribute values dynamically
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.keys(updateData).forEach(key => {
      updateExpressionParts.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updateData[key as keyof Partial<Box>];
    });

    // Always update the updatedAt timestamp
    updateExpressionParts.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: BoxModel.getTableName(),
      Key: { codigo: codigo },
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    return result.Attributes as Box;
  } catch (error) {
    console.error('Error updating box:', error);
    throw error;
  }
};

export default updateBox; 