const { dynamoDB, Tables } = require('./index');

// DynamoDB client and table name for Issues
const tableName = Tables.Issues;

module.exports = { dynamoDB, tableName }; 