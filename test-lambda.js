// Set environment variables
process.env.PALLETS_TABLE = 'Pallets';
process.env.HUEVOS_TABLE = 'Huevos';

// Mock AWS SDK
const AWS = require('aws-sdk');
const mockDynamoDb = require('./utils/mockDb');

// Save original
const originalDocumentClient = AWS.DynamoDB.DocumentClient;

// Override for testing
AWS.DynamoDB.DocumentClient = function() {
  return mockDynamoDb;
};

// Run lambda-local
const lambdaLocal = require('lambda-local');
const path = require('path');

lambdaLocal.execute({
  event: require('./event.json'),
  lambdaPath: path.join(__dirname, 'index.js'),
  profilePath: '~/.aws/credentials',
  profileName: 'default',
  timeoutMs: 3000,
  callback: function(err, result) {
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