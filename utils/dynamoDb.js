const AWS = require('aws-sdk');
const dbUtils = require('./db');

// Create a simple wrapper to match the interface expected by controllers
const dynamoDb = {
  get: async (params) => {
    return {
      Item: await dbUtils.getItem(params.TableName, params.Key)
    };
  },
  
  put: async (params) => {
    return await dbUtils.putItem(params.TableName, params.Item);
  },
  
  update: async (params) => {
    const { TableName, Key, UpdateExpression, ExpressionAttributeValues, ExpressionAttributeNames } = params;
    const Attributes = await dbUtils.updateItem(
      TableName, 
      Key, 
      UpdateExpression, 
      ExpressionAttributeValues, 
      ExpressionAttributeNames
    );
    return { Attributes };
  },
  
  delete: async (params) => {
    const Attributes = await dbUtils.deleteItem(params.TableName, params.Key);
    return { Attributes };
  },
  
  query: async (params) => {
    const { 
      TableName, 
      KeyConditionExpression, 
      ExpressionAttributeValues, 
      ExpressionAttributeNames,
      IndexName
    } = params;
    
    const Items = await dbUtils.queryItems(
      TableName, 
      KeyConditionExpression, 
      ExpressionAttributeValues, 
      ExpressionAttributeNames,
      IndexName
    );
    
    return { Items };
  },
  
  scan: async (params) => {
    const {
      TableName,
      FilterExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames
    } = params;
    
    const Items = await dbUtils.scanItems(
      TableName,
      FilterExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames
    );
    
    return { Items };
  }
};

module.exports = dynamoDb; 