"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../utils/db"));
const response_1 = __importDefault(require("../utils/response"));
exports.default = async () => {
    try {
        // Use scanItems with a filter for PACKING location
        const boxes = await db_1.default.scanItems("Huevos", // Assuming this is the table name
        "ubicacion = :location", { ":location": "PACKING" });
        return (0, response_1.default)(200, "Cajas en PACKING obtenidas exitosamente", boxes);
    }
    catch (error) {
        return (0, response_1.default)(500, "Error al obtener cajas en PACKING", { error: error.message });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGFja2luZ0VnZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9oYW5kbGVycy9nZXRQYWNraW5nRWdncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHFEQUFrQztBQUNsQyxpRUFBa0Q7QUFFbEQsa0JBQWUsS0FBSyxJQUFJLEVBQUU7SUFDdEIsSUFBSSxDQUFDO1FBQ0QsbURBQW1EO1FBQ25ELE1BQU0sS0FBSyxHQUFHLE1BQU0sWUFBTyxDQUFDLFNBQVMsQ0FDakMsUUFBUSxFQUFFLGtDQUFrQztRQUM1Qyx1QkFBdUIsRUFDdkIsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLENBQzdCLENBQUM7UUFDRixPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLHlDQUF5QyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ2xCLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsbUNBQW1DLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDakcsQ0FBQztBQUNMLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnZXRFZ2dzIGZyb20gXCIuL2dldEJveGVzXCI7XG5pbXBvcnQgZGJVdGlscyBmcm9tIFwiLi4vdXRpbHMvZGJcIjtcbmltcG9ydCBjcmVhdGVBcGlSZXNwb25zZSBmcm9tIFwiLi4vdXRpbHMvcmVzcG9uc2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIFVzZSBzY2FuSXRlbXMgd2l0aCBhIGZpbHRlciBmb3IgUEFDS0lORyBsb2NhdGlvblxuICAgICAgICBjb25zdCBib3hlcyA9IGF3YWl0IGRiVXRpbHMuc2Nhbkl0ZW1zKFxuICAgICAgICAgICAgXCJIdWV2b3NcIiwgLy8gQXNzdW1pbmcgdGhpcyBpcyB0aGUgdGFibGUgbmFtZVxuICAgICAgICAgICAgXCJ1YmljYWNpb24gPSA6bG9jYXRpb25cIixcbiAgICAgICAgICAgIHsgXCI6bG9jYXRpb25cIjogXCJQQUNLSU5HXCIgfVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBcIkNhamFzIGVuIFBBQ0tJTkcgb2J0ZW5pZGFzIGV4aXRvc2FtZW50ZVwiLCBib3hlcyk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBcIkVycm9yIGFsIG9idGVuZXIgY2FqYXMgZW4gUEFDS0lOR1wiLCB7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xuICAgIH1cbn07XG4iXX0=