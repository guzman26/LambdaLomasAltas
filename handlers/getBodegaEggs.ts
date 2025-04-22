const databaseService = require("../utils/db");
const createApiResponse = require("../utils/response");

/**
 * Retrieves all eggs stored in the BODEGA location
 * @returns {Object} API response with eggs data
 */
module.exports = async () => {
    try {
        console.log("🔍 Fetching eggs from BODEGA...");
        const eggs = await databaseService.getEggsByLocation("BODEGA");

        console.log(`📦 Retrieved ${eggs.length} eggs from BODEGA`);
        return createApiResponse(200, eggs);
    } catch (error: any) {
        console.error("❌ Error fetching eggs from BODEGA:", error);
        return createApiResponse(500, "Error retrieving eggs from BODEGA", { error: error.message });
    }
};
