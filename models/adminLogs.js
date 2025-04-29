const { dynamoDB, Tables } = require('./index');

// DynamoDB client and table name for AdminLogs
const tableName = Tables.AdminLogs;

module.exports = { dynamoDB, tableName }; 