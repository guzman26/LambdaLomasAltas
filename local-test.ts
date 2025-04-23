// Simple script to test Lambda handlers directly
// This doesn't go through the Lambda infrastructure but tests the business logic

// Set environment variables
process.env.PALLETS_TABLE = 'Pallets';
process.env.HUEVOS_TABLE = 'Huevos';
process.env.BOXES_TABLE_NAME = 'Boxes';
process.env.ISSUES_TABLE = 'Issues';

// Import using require
const { handler } = require('./index');
import { LambdaEvent } from './types';
import AWS from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';

// Test cases for different endpoints
const testCases: Record<string, LambdaEvent> = {
  movePallet: {
    httpMethod: "POST",
    path: "/movePallet",
    body: JSON.stringify({
      codigo: "123456789001",
      ubicacion: "BODEGA"
    }),
    resource: '',
    pathParameters: {},
    stageVariables: null,
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: null,
    isBase64Encoded: false,
    requestContext: {} as any
  },
  
  getPallets: {
    httpMethod: "GET",
    path: "/getPallets",
    resource: '',
    pathParameters: {},
    stageVariables: null,
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: null,
    isBase64Encoded: false,
    requestContext: {} as any
  },
  
  getBodegaEggs: {
    httpMethod: "GET",
    path: "/getBodegaEggs",
    resource: '',
    pathParameters: {},
    stageVariables: null,
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: null,
    isBase64Encoded: false,
    requestContext: {} as any
  }
};

// Run the test for a specific endpoint or all endpoints
async function runTest(endpoint?: string): Promise<void> {
  try {
    if (endpoint && testCases[endpoint]) {
      await testSingleEndpoint(endpoint, testCases[endpoint]);
    } else {
      // Test all endpoints
      for (const [name, event] of Object.entries(testCases)) {
        await testSingleEndpoint(name, event);
      }
    }
    
    console.log("\nAll tests completed!");
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

async function testSingleEndpoint(name: string, event: LambdaEvent): Promise<void> {
  console.log(`\n\nTesting ${name} endpoint...`);
  console.log("Input:", JSON.stringify(event, null, 2));
  
  const result = await handler(event);
  
  console.log("\nResult:");
  console.log(JSON.stringify(result, null, 2));
}

// Change to a specific endpoint name to test only that endpoint
// runTest("movePallet");  
runTest(); 