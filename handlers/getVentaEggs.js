const db = require("../utils/db.js");
const response = require("../utils/response");

module.exports = async () => {
    try {
        const eggs = await db.getEggsByLocation("VENTA");
        return response(200, eggs);
    } catch (error) {
        return response(500, "Error al obtener huevos en VENTA", { error: error.message });
    }
};
