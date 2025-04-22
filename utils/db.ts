import AWS from 'aws-sdk';
import { DynamoDbItem } from '../types';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const EGG_TABLE = process.env.HUEVOS_TABLE || "Huevos";
const PALLETS_TABLE = process.env.PALLETS_TABLE || "Pallets";

/**
 * Utility functions for database operations
 */
const dbUtils = {
  /**
   * Generic function to get an item by its key from a table
   */
  async getItem(tableName: string, key: Record<string, any>): Promise<DynamoDbItem | undefined> {
    try {
      const params = {
        TableName: tableName,
        Key: key
      };
      const result = await dynamoDB.get(params).promise();
      return result.Item || undefined;
    } catch (error) {
      console.error(`❌ Error getting item from ${tableName}:`, error);
      throw new Error(`Error getting item from ${tableName}`);
    }
  },

  /**
   * Generic function to put an item in a table
   */
  async putItem(tableName: string, item: DynamoDbItem): Promise<AWS.DynamoDB.DocumentClient.PutItemOutput> {
    try {
      const params = {
        TableName: tableName,
        Item: item
      };
      return await dynamoDB.put(params).promise();
    } catch (error) {
      console.error(`❌ Error putting item in ${tableName}:`, error);
      throw new Error(`Error putting item in ${tableName}`);
    }
  },

  /**
   * Generic function to update an item in a table
   */
  async updateItem(
    tableName: string, 
    key: Record<string, any>, 
    updateExpression: string, 
    expressionAttributeValues: Record<string, any>, 
    expressionAttributeNames: Record<string, string> | null = null
  ): Promise<DynamoDbItem> {
    try {
      const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW"
      };

      if (expressionAttributeNames) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }

      const result = await dynamoDB.update(params).promise();
      return result.Attributes as DynamoDbItem;
    } catch (error) {
      console.error(`❌ Error updating item in ${tableName}:`, error);
      throw new Error(`Error updating item in ${tableName}`);
    }
  },

  /**
   * Generic function to delete an item from a table
   */
  async deleteItem(tableName: string, key: Record<string, any>): Promise<DynamoDbItem> {
    try {
      const params = {
        TableName: tableName,
        Key: key,
        ReturnValues: "ALL_OLD"
      };
      const result = await dynamoDB.delete(params).promise();
      return result.Attributes as DynamoDbItem;
    } catch (error) {
      console.error(`❌ Error deleting item from ${tableName}:`, error);
      throw new Error(`Error deleting item from ${tableName}`);
    }
  },

  /**
   * Generic function to query items from a table
   */
  async queryItems(
    tableName: string, 
    keyConditionExpression: string, 
    expressionAttributeValues: Record<string, any>, 
    expressionAttributeNames: Record<string, string> | null = null, 
    indexName: string | null = null
  ): Promise<DynamoDbItem[]> {
    try {
      const params: AWS.DynamoDB.DocumentClient.QueryInput = {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues
      };

      if (expressionAttributeNames) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }

      if (indexName) {
        params.IndexName = indexName;
      }

      const result = await dynamoDB.query(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error(`❌ Error querying items from ${tableName}:`, error);
      throw new Error(`Error querying items from ${tableName}`);
    }
  },

  /**
   * Generic function to scan items from a table
   */
  async scanItems(
    tableName: string, 
    filterExpression: string | null = null, 
    expressionAttributeValues: Record<string, any> | null = null, 
    expressionAttributeNames: Record<string, string> | null = null
  ): Promise<DynamoDbItem[]> {
    try {
      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: tableName
      };

      if (filterExpression) {
        params.FilterExpression = filterExpression;
      }

      if (expressionAttributeValues) {
        params.ExpressionAttributeValues = expressionAttributeValues;
      }

      if (expressionAttributeNames) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }

      const result = await dynamoDB.scan(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error(`❌ Error scanning items from ${tableName}:`, error);
      throw new Error(`Error scanning items from ${tableName}`);
    }
  }
};

export default {
  getItem: dbUtils.getItem,
  putItem: dbUtils.putItem,
  updateItem: dbUtils.updateItem,
  deleteItem: dbUtils.deleteItem,
  queryItems: dbUtils.queryItems,
  scanItems: dbUtils.scanItems
}; 