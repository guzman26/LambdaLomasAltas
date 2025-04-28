const database = require("../utils/db"); // Assuming you have a DB module
const response = require("../utils/response");

const getPallets = async (filters) => {
    let query = {};
    try {
        const pallets = await database.getPallets();
        return response(200, pallets);
    } catch (error) {
        return response(500, "Error al obtener huevos", { error: error.message });
    }
};

module.exports = getPallets;
