const { dynamoDB, Tables } = require('./index');

// DynamoDB client and table name for Pallets
const tableName = Tables.Pallets;

module.exports = { dynamoDB, tableName }; 