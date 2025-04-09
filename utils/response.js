/**
 * Creates a standardized API response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {object|null} data - Optional data payload
 * @returns {object} Formatted API response
 */
const createApiResponse = (statusCode, message, data = null) => {
  const responsePayload = data ? { message, data } : { message };

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(responsePayload),
  };
};

module.exports = createApiResponse;
