const database = require("../utils/db"); // Assuming you have a DB module
const response = require("../utils/response");

const getEggs = async (filters) => {
    let query = {};
    try {
        const eggs = await database.getAllEggs();
        return response(200, eggs);
    } catch (error) {
        return response(500, "Error al obtener huevos", { error: error.message });
    }
};

module.exports = getEggs;
