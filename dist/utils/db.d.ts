import AWS from 'aws-sdk';
import { DynamoDbItem } from '../types';
declare const _default: {
    getItem: (tableName: string, key: Record<string, any>) => Promise<DynamoDbItem | undefined>;
    putItem: (tableName: string, item: DynamoDbItem) => Promise<AWS.DynamoDB.DocumentClient.PutItemOutput>;
    updateItem: (tableName: string, key: Record<string, any>, updateExpression: string, expressionAttributeValues: Record<string, any>, expressionAttributeNames?: Record<string, string> | null) => Promise<DynamoDbItem>;
    deleteItem: (tableName: string, key: Record<string, any>) => Promise<DynamoDbItem>;
    queryItems: (tableName: string, keyConditionExpression: string, expressionAttributeValues: Record<string, any>, expressionAttributeNames?: Record<string, string> | null, indexName?: string | null) => Promise<DynamoDbItem[]>;
    scanItems: (tableName: string, filterExpression?: string | null, expressionAttributeValues?: Record<string, any> | null, expressionAttributeNames?: Record<string, string> | null) => Promise<DynamoDbItem[]>;
};
export default _default;
