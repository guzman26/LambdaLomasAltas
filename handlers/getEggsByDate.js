const getEggs = require("./getBoxes");
const createApiResponse = require("../utils/response");

/**
 * Retrieves eggs filtered by date range
 * @param {Object} event - API Gateway event object
 * @returns {Object} API response with eggs data
 */
module.exports = async (event) => {
    const { fechaInicio, fechaFin } = event.queryStringParameters || {};

    if (!fechaInicio || !fechaFin) {
        return createApiResponse(400, "Start date and end date are required");
    }

    try {
        const eggs = await getEggs({ fechaInicio, fechaFin });
        return createApiResponse(200, eggs);
    } catch (error) {
        console.error("❌ Error retrieving eggs by date:", error);
        return createApiResponse(500, "Error retrieving eggs by date", { error: error.message });
    }
};
