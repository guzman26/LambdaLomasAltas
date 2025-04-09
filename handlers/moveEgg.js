const databaseService = require("../utils/db");
const createApiResponse = require("../utils/response");

/**
 * Moves an egg box from one location to another
 * @param {string} code - Box code
 * @param {string} destination - Destination location
 * @returns {Promise<object>} API response with status and message
 */
const moveEgg = async (code, destination) => {
    // Determine current and new states based on destination
    const currentState = destination === "BODEGA" ? "PACKING" : "BODEGA";
    const newState = destination;

    try {
        // Get boxes in the current state with the given code
        const boxes = await databaseService.getEggsByState(code, currentState);
        
        if (boxes.length === 0) {
            return createApiResponse(404, `No boxes found in state ${currentState} with code ${code}.`);
        }

        const selectedBox = boxes[0];

        // Update egg state and record the movement
        const updatedEgg = await databaseService.updateEggState(
            selectedBox.codigo, 
            selectedBox.idCaja, 
            newState, 
            destination
        );

        return createApiResponse(200, {
            message: `Box ${selectedBox.idCaja} moved to ${newState}`,
            movementHistory: updatedEgg.historialMovimientos
        });
    } catch (error) {
        console.error(`❌ Error moving egg: ${error.message}`, error);
        return createApiResponse(500, `Error moving box: ${error.message}`);
    }
};

module.exports = {
    moveEgg
};
