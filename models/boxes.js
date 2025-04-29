const { dynamoDB, Tables } = require('./index');

// DynamoDB client and table name for Boxes
const tableName = Tables.Boxes;

module.exports = { dynamoDB, tableName }; 