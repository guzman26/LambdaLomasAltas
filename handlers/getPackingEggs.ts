import getEggs from "./getBoxes";
import dbUtils from "../utils/db";
import createApiResponse from "../utils/response";

export default async () => {
    try {
        // Use scanItems with a filter for PACKING location
        const boxes = await dbUtils.scanItems(
            "Huevos", // Assuming this is the table name
            "ubicacion = :location",
            { ":location": "PACKING" }
        );
        return createApiResponse(200, "Cajas en PACKING obtenidas exitosamente", boxes);
    } catch (error: any) {
        return createApiResponse(500, "Error al obtener cajas en PACKING", { error: error.message });
    }
};
