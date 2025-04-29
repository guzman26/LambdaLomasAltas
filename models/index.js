const AWS = require('aws-sdk');

// Shared DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Determine the current stage (branch) to set table suffix
// We expect an environment variable STAGE set to the branch name (e.g., 'dev' or 'main')
const stage = process.env.STAGE || 'dev';
const suffix = stage === 'dev' ? '-dev' : '';

// Table name mappings
const Tables = {
  Boxes: `Boxes${suffix}`,
  Pallets: `Pallets${suffix}`,
  Issues: `Issues${suffix}`,
  AdminLogs: `AdminLogs${suffix}`,
  SystemConfig: `SystemConfig${suffix}`
};

module.exports = { dynamoDB, Tables }; 