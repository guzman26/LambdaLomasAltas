const AWS = require('aws-sdk');
const createApiResponse = require('../utils/response');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Fetch all open pallets from the "Pallets" table
 * @returns {Promise<object>} An API-style response with status & message
 */
const getOpenPallets = async () => {
  try {
    // 1) Define params for scanning only items where status = 'OPEN'
    const params = {
      TableName: 'Pallets',
      FilterExpression: '#status = :openStatus',
      ExpressionAttributeNames: {
        '#status': 'estado',
      },
      ExpressionAttributeValues: {
        ':openStatus': 'open',
      },
    };

    // 2) Perform the scan on DynamoDB
    const result = await dynamoDB.scan(params).promise();

    // 3) Return success if scan is successful
    return createApiResponse(200, `✅ Found ${result.Items.length} open pallet(s)`, result.Items);
  } catch (error) {
    // 4) Return error if any exception is thrown
    return createApiResponse(500, `❌ Error fetching open pallets: ${error.message}`);
  }
};

module.exports = getOpenPallets;
