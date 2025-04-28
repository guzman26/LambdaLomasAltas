const getBoxes = require("./getBoxes");
const db = require("../../utils/db");
const response = require("../../utils/response");

module.exports = async () => {
    try {
        const eggs = await db.getBoxesByLocation("PACKING");
        return response(200, eggs);
    } catch (error) {
        return response(500, "Error al obtener huevos en PACKING", { error: error.message });
    }
};
