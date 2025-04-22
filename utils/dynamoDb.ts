import AWS from 'aws-sdk';
import { DynamoDbItem } from '../types';

// Import the db.js file with a type assertion
// @ts-ignore
import dbUtils from './db';

interface DynamoParams {
  TableName: string;
  Key?: Record<string, any>;
  UpdateExpression?: string;
  ExpressionAttributeValues?: Record<string, any>;
  ExpressionAttributeNames?: Record<string, any>;
  Item?: DynamoDbItem;
  ProjectionExpression?: string;
  FilterExpression?: string;
  KeyConditionExpression?: string;
  IndexName?: string;
  ReturnValues?: string;
}

// Create a simple wrapper to match the interface expected by controllers
const dynamoDb = {
  get: async (params: DynamoParams): Promise<{ Item?: DynamoDbItem }> => {
    return {
      Item: await dbUtils.getItem(params.TableName, params.Key!)
    };
  },
  
  put: async (params: DynamoParams): Promise<unknown> => {
    return await dbUtils.putItem(params.TableName, params.Item!);
  },
  
  update: async (params: DynamoParams): Promise<{ Attributes?: DynamoDbItem }> => {
    const { TableName, Key, UpdateExpression, ExpressionAttributeValues, ExpressionAttributeNames } = params;
    const Attributes = await dbUtils.updateItem(
      TableName, 
      Key!, 
      UpdateExpression!, 
      ExpressionAttributeValues!, 
      ExpressionAttributeNames
    );
    return { Attributes };
  },
  
  delete: async (params: DynamoParams): Promise<{ Attributes?: DynamoDbItem }> => {
    const Attributes = await dbUtils.deleteItem(params.TableName, params.Key!);
    return { Attributes };
  },
  
  query: async (params: DynamoParams): Promise<{ Items: DynamoDbItem[] }> => {
    const { 
      TableName, 
      KeyConditionExpression, 
      ExpressionAttributeValues, 
      ExpressionAttributeNames,
      IndexName
    } = params;
    
    const Items = await dbUtils.queryItems(
      TableName, 
      KeyConditionExpression!, 
      ExpressionAttributeValues!, 
      ExpressionAttributeNames,
      IndexName
    );
    
    return { Items };
  },
  
  scan: async (params: DynamoParams): Promise<{ Items: DynamoDbItem[] }> => {
    const Items = await dbUtils.scanItems(
      params.TableName,
      params.FilterExpression,
      params.ExpressionAttributeValues,
      params.ExpressionAttributeNames
    );
    
    return { Items };
  }
};

export default dynamoDb; 