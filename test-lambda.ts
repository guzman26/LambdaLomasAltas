// Set environment variables
process.env.PALLETS_TABLE = 'Pallets';
process.env.HUEVOS_TABLE = 'Huevos';

// Mock AWS SDK
import AWS from 'aws-sdk';
import mockDynamoDb from './utils/mockDb';
import { LambdaEvent } from './types';
import path from 'path';
import lambdaLocal from 'lambda-local';

// Save original
const originalDocumentClient = AWS.DynamoDB.DocumentClient;

// Override for testing
AWS.DynamoDB.DocumentClient = function() {
  return mockDynamoDb;
} as any;

// Run lambda-local
lambdaLocal.execute({
  event: require('./event.json') as LambdaEvent,
  lambdaPath: path.join(__dirname, 'dist/index.js'),
  profilePath: '~/.aws/credentials',
  profileName: 'default',
  timeoutMs: 3000,
  callback: function(err: Error | null, result: any) {
    if (err) {
      console.error('Lambda execution failed:', err);
    } else {
      console.log('Lambda execution result:', JSON.stringify(result, null, 2));
    }
    
    // Restore original AWS SDK
    AWS.DynamoDB.DocumentClient = originalDocumentClient;
  }
}).catch(err => {
  console.error('Lambda-local execution error:', err);
  // Restore original AWS SDK
  AWS.DynamoDB.DocumentClient = originalDocumentClient;
}); 