import AWS from 'aws-sdk';
import { DynamoDbItem } from '../types';
/**
 * Utility functions for database operations
 */
declare const dbUtils: {
    /**
     * Generic function to get an item by its key from a table
     */
    getItem(tableName: string, key: Record<string, any>): Promise<DynamoDbItem | undefined>;
    /**
     * Generic function to put an item in a table
     */
    putItem(tableName: string, item: DynamoDbItem): Promise<AWS.DynamoDB.DocumentClient.PutItemOutput>;
    /**
     * Generic function to update an item in a table
     */
    updateItem(tableName: string, key: Record<string, any>, updateExpression: string, expressionAttributeValues: Record<string, any>, expressionAttributeNames?: Record<string, string> | null): Promise<DynamoDbItem>;
    /**
     * Generic function to delete an item from a table
     */
    deleteItem(tableName: string, key: Record<string, any>): Promise<DynamoDbItem>;
    /**
     * Generic function to query items from a table
     */
    queryItems(tableName: string, keyConditionExpression: string, expressionAttributeValues: Record<string, any>, expressionAttributeNames?: Record<string, string> | null, indexName?: string | null): Promise<DynamoDbItem[]>;
    /**
     * Generic function to scan items from a table
     */
    scanItems(tableName: string, filterExpression?: string | null, expressionAttributeValues?: Record<string, any> | null, expressionAttributeNames?: Record<string, string> | null): Promise<DynamoDbItem[]>;
};
export default dbUtils;
