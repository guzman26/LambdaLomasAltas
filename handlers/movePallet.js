const databaseService = require("../utils/db");
const createApiResponse = require("../utils/response");

/**
 * Moves a pallet and all its boxes to a new location
 * @param {string} palletCode - The pallet code
 * @param {string} destination - Destination location (BODEGA, VENTA)
 * @returns {Promise<object>} API response with status and message
 */
const movePallet = async (palletCode, destination) => {
    // Validate destination
    const validDestinations = ["TRANSITO", "BODEGA", "VENTA"];
    if (!validDestinations.includes(destination)) {
        return createApiResponse(400, `Invalid destination: ${destination}. Must be Transito, BODEGA or VENTA.`);
    }

    try {
        // Move the pallet with all its boxes
        const result = await databaseService.movePalletWithBoxes(palletCode, destination);
        
        return createApiResponse(200, {
            message: `Pallet ${palletCode} moved to ${destination} with ${result.boxesUpdated} boxes`,
            boxesUpdated: result.boxesUpdated
        });
    } catch (error) {
        console.error(`❌ Error moving pallet: ${error.message}`, error);
        return createApiResponse(500, `Error moving pallet: ${error.message}`);
    }
};

module.exports = {
    movePallet
}; 