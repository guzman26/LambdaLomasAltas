import { ApiResponse, Pallet } from '../../types';
import createApiResponse from '../../utils/response';
import dynamoDb from '../../utils/dynamoDb';

/**
 * Gets all pallets
 */
export const getAllPallets = async (): Promise<ApiResponse> => {
  console.log('Getting all pallets');
  
  try {
    const { Items } = await dynamoDb.scan({
      TableName: process.env.PALLETS_TABLE || 'Pallets',
    });
    
    return createApiResponse(200, 'All pallets', Items);
  } catch (error) {
    console.error('Error getting all pallets:', error);
    return createApiResponse(500, (error as Error).message);
  }
};

/**
 * Gets active pallets
 */
export const getActivePallets = async (): Promise<ApiResponse> => {
  console.log('Getting active pallets');
  
  try {
    const { Items } = await dynamoDb.scan({
      TableName: process.env.PALLETS_TABLE || 'Pallets',
      FilterExpression: '#estado = :active',
      ExpressionAttributeNames: {
        '#estado': 'estado'
      },
      ExpressionAttributeValues: {
        ':active': 'open'
      }
    });
    
    return createApiResponse(200, 'Active pallets', Items);
  } catch (error) {
    console.error('Error getting active pallets:', error);
    return createApiResponse(500, (error as Error).message);
  }
};

/**
 * Gets closed pallets
 */
export const getClosedPallets = async (ubicacion?: string): Promise<ApiResponse> => {
  console.log('Getting closed pallets', ubicacion ? `at ${ubicacion}` : '');
  
  try {
    let filterExpression = '#estado = :closed';
    let expressionAttributeValues: Record<string, any> = {
      ':closed': 'closed'
    };
    
    if (ubicacion) {
      filterExpression += ' AND #ubicacion = :ubicacion';
      expressionAttributeValues[':ubicacion'] = ubicacion;
    }
    
    const { Items } = await dynamoDb.scan({
      TableName: process.env.PALLETS_TABLE || 'Pallets',
      FilterExpression: filterExpression,
      ExpressionAttributeNames: {
        '#estado': 'estado',
        '#ubicacion': 'ubicacion'
      },
      ExpressionAttributeValues: expressionAttributeValues
    });
    
    return createApiResponse(200, 'Closed pallets', Items);
  } catch (error) {
    console.error('Error getting closed pallets:', error);
    return createApiResponse(500, (error as Error).message);
  }
}; 

export default {
  getAllPallets,
  getActivePallets,
  getClosedPallets
};