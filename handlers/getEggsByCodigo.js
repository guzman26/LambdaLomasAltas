const getEggs = require("./getEggs");
const response = require("../utils/response");

module.exports = async (event) => {
    const { codigo } = event.queryStringParameters || {};
    
    if (!codigo) {
        return response(400, "Debe proporcionar un código");
    }

    try {
        const egg = await getEggs({ codigo });
        return response(200, egg);
    } catch (error) {
        return response(500, "Error al obtener huevo por código", { error: error.message });
    }
};
