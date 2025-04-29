const { dynamoDB, Tables } = require('./index');

// DynamoDB client and table name for SystemConfig
const tableName = Tables.SystemConfig;

module.exports = { dynamoDB, tableName }; 