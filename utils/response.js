/**
 * Creates a standardized API response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {object} data - Response data
 * @returns {object} API response object
 */
function createApiResponse(statusCode, message, data = null) {
  const response = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    },
    body: JSON.stringify({
      status: statusCode < 400 ? 'success' : 'error',
      message,
      data
    })
  };
  return response;
}

module.exports = createApiResponse;
