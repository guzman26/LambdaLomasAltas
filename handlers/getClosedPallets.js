const AWS = require('aws-sdk');
const createApiResponse = require('../utils/response');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Fetch all pallets with estado = "closed" and a given ubicacion (attribute).
 * Example: If you pass "PACKING", only returns closed pallets in PACKING.
 *
 * @param {string} ubicacionValue - e.g. "PACKING"
 * @returns {Promise<object>} API-style response
 */
const getClosedPalletsByUbicacion = async ubicacionValue => {
  // Optionally uppercase or sanitize the input
  const location = ubicacionValue.toUpperCase();

  try {
    // We keep #ubicacion as a field name reference in Dynamo,
    // but the actual value is dynamic
    const params = {
      TableName: 'Pallets',
      FilterExpression: '#estado = :closed AND #ubicacion = :loc',
      ExpressionAttributeNames: {
        '#estado': 'estado',
        '#ubicacion': 'ubicacion', // The table attribute name
      },
      ExpressionAttributeValues: {
        ':closed': 'closed',
        ':loc': location,
      },
    };

    // Scan for matching items
    const result = await dynamoDB.scan(params).promise();

    // Return success with the found items
    return createApiResponse(
      200,
      `✅ Found ${result.Items.length} closed pallet(s) in ${location}`,
      result.Items
    );
  } catch (error) {
    // Return error with status 500
    return createApiResponse(
      500,
      `❌ Error fetching closed pallets for ubicacion=${ubicacionValue}: ${error.message}`
    );
  }
};

module.exports = getClosedPalletsByUbicacion;
