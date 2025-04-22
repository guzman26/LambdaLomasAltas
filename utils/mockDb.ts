import { DynamoDbItem, Pallet } from '../types';

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

interface DynamoResponse {
  Item?: DynamoDbItem;
  Items?: DynamoDbItem[];
  Attributes?: DynamoDbItem;
  LastEvaluatedKey?: Record<string, any>;
}

const mockDb = {
  getItem: async (tableName: string, key: Record<string, any>): Promise<DynamoDbItem | undefined> => {
    console.log(`Mock DB: Getting item from ${tableName} with key`, key);
    // Return mock data based on the table and key
    if (tableName === 'Pallets' && key.codigo === '123456789001') {
      return {
        codigo: '123456789001',
        estado: 'open',
        cajas: [],
        cantidadCajas: 0,
        fechaCreacion: '2023-04-21T15:30:00Z',
        ubicacion: 'TRANSITO'
      };
    }
    return undefined;
  },

  putItem: async (tableName: string, item: DynamoDbItem): Promise<{ success: boolean }> => {
    console.log(`Mock DB: Putting item in ${tableName}:`, item);
    return { success: true };
  },

  updateItem: async (
    tableName: string, 
    key: Record<string, any>, 
    updateExpression: string, 
    expressionAttributeValues: Record<string, any>, 
    expressionAttributeNames?: Record<string, string>
  ): Promise<DynamoDbItem> => {
    console.log(`Mock DB: Updating item in ${tableName} with key`, key);
    console.log('Update expression:', updateExpression);
    console.log('Expression attribute values:', expressionAttributeValues);
    
    // For the movePallet operation, return a mock updated pallet
    if (tableName === 'Pallets' && key.codigo === '123456789001') {
      return {
        codigo: '123456789001',
        estado: 'open',
        cajas: [],
        cantidadCajas: 0,
        fechaCreacion: '2023-04-21T15:30:00Z',
        ubicacion: expressionAttributeValues[':location'],
        updatedAt: expressionAttributeValues[':updatedAt']
      };
    }
    
    return {};
  },

  deleteItem: async (tableName: string, key: Record<string, any>): Promise<{ success: boolean }> => {
    console.log(`Mock DB: Deleting item from ${tableName} with key`, key);
    return { success: true };
  },

  queryItems: async (
    tableName: string, 
    keyConditionExpression: string, 
    expressionAttributeValues: Record<string, any>, 
    expressionAttributeNames?: Record<string, string>,
    indexName?: string
  ): Promise<DynamoDbItem[]> => {
    console.log(`Mock DB: Querying items from ${tableName}`);
    console.log('Key condition expression:', keyConditionExpression);
    console.log('Expression attribute values:', expressionAttributeValues);
    
    // Return empty array as default
    return [];
  },

  scanItems: async (
    tableName: string, 
    filterExpression?: string, 
    expressionAttributeValues?: Record<string, any>,
    expressionAttributeNames?: Record<string, string>
  ): Promise<DynamoDbItem[]> => {
    console.log(`Mock DB: Scanning items from ${tableName}`);
    if (filterExpression) console.log('Filter expression:', filterExpression);
    
    // Return empty array as default
    return [];
  }
};

// Create a wrapper that matches the DynamoDB Document Client interface
const mockDynamoDb = {
  get: async (params: DynamoParams): Promise<{ Item?: DynamoDbItem }> => {
    return {
      Item: await mockDb.getItem(params.TableName, params.Key!)
    };
  },
  
  put: async (params: DynamoParams): Promise<{ success: boolean }> => {
    return await mockDb.putItem(params.TableName, params.Item!);
  },
  
  update: async (params: DynamoParams): Promise<{ Attributes?: DynamoDbItem }> => {
    const { TableName, Key, UpdateExpression, ExpressionAttributeValues, ExpressionAttributeNames } = params;
    const Attributes = await mockDb.updateItem(
      TableName, 
      Key!, 
      UpdateExpression!, 
      ExpressionAttributeValues!, 
      ExpressionAttributeNames
    );
    return { Attributes };
  },
  
  delete: async (params: DynamoParams): Promise<{ success: boolean }> => {
    return await mockDb.deleteItem(params.TableName, params.Key!);
  },
  
  query: async (params: DynamoParams): Promise<{ Items: DynamoDbItem[] }> => {
    const { 
      TableName, 
      KeyConditionExpression, 
      ExpressionAttributeValues, 
      ExpressionAttributeNames,
      IndexName
    } = params;
    
    const Items = await mockDb.queryItems(
      TableName, 
      KeyConditionExpression!, 
      ExpressionAttributeValues!, 
      ExpressionAttributeNames,
      IndexName
    );
    
    return { Items };
  },
  
  scan: async (params: DynamoParams): Promise<{ Items: DynamoDbItem[] }> => {
    const Items = await mockDb.scanItems(
      params.TableName,
      params.FilterExpression,
      params.ExpressionAttributeValues,
      params.ExpressionAttributeNames
    );
    
    return { Items };
  }
};

export default mockDynamoDb; 