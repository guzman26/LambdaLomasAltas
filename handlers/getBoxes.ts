const database = require("../utils/db"); // Assuming you have a DB module
const response = require("../utils/response");

const getBoxes = async (filters: any) => {
    let query = {};
    try {
        const boxes = await database.getAllBoxes();
        return response(200, boxes);
    } catch (error: any) {
        return response(500, "Error al obtener cajas", { error: error.message });
    }
};

export default getBoxes;
