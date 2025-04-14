/**
 * Creates a standardized API response with the appropriate headers
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {any} data - Optional data to include in the response
 * @returns {object} API Gateway response object
 */
const createApiResponse = (statusCode, message, data = null) => {
  const response = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      // Add CORS headers
      'Access-Control-Allow-Origin': '*', // Consider restricting this in production
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
    },
    body: JSON.stringify({
      message,
      data,
    }),
  };
  
  return response;
};

module.exports = createApiResponse;
