import { DynamoDbItem } from '../types';
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
declare const dynamoDb: {
    get: (params: DynamoParams) => Promise<{
        Item?: DynamoDbItem;
    }>;
    put: (params: DynamoParams) => Promise<unknown>;
    update: (params: DynamoParams) => Promise<{
        Attributes?: DynamoDbItem;
    }>;
    delete: (params: DynamoParams) => Promise<{
        Attributes?: DynamoDbItem;
    }>;
    query: (params: DynamoParams) => Promise<{
        Items: DynamoDbItem[];
    }>;
    scan: (params: DynamoParams) => Promise<{
        Items: DynamoDbItem[];
    }>;
};
export default dynamoDb;
