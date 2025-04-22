import { DynamoDbItem } from '../types';

/**
 * Get an item from DynamoDB by key
 */
export function getItem(
  tableName: string, 
  key: Record<string, any>
): Promise<DynamoDbItem | null>;

/**
 * Query items from DynamoDB
 */
export function queryItems(
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, any>,
  indexName?: string
): Promise<DynamoDbItem[]>;

/**
 * Scan items from DynamoDB with optional filter
 */
export function scanItems(
  tableName: string,
  filterExpression?: string,
  expressionAttributeValues?: Record<string, any>
): Promise<DynamoDbItem[]>;

/**
 * Put an item in DynamoDB
 */
export function putItem(
  tableName: string,
  item: DynamoDbItem
): Promise<DynamoDbItem>;

/**
 * Update an item in DynamoDB
 */
export function updateItem(
  tableName: string,
  key: Record<string, any>,
  updateExpression: string,
  expressionAttributeValues: Record<string, any>,
  expressionAttributeNames?: Record<string, string>
): Promise<DynamoDbItem>;

/**
 * Delete an item from DynamoDB
 */
export function deleteItem(
  tableName: string,
  key: Record<string, any>
): Promise<DynamoDbItem | null>;

/**
 * Check if an item exists in DynamoDB
 */
export function itemExists(
  tableName: string,
  key: Record<string, any>
): Promise<boolean>;

/**
 * Batch get items from DynamoDB
 */
export function batchGetItems(
  tableName: string,
  keys: Record<string, any>[]
): Promise<DynamoDbItem[]>; 