"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pallets_1 = __importDefault(require("../controllers/pallets"));
const response_1 = __importDefault(require("../utils/response"));
/**
 * Moves a pallet to a new location
 * @param codigo - The pallet code
 * @param ubicacion - The new location
 * @returns API response
 */
async function movePallet(codigo, ubicacion) {
    try {
        // Get the pallet to check if it exists
        console.log(`Attempting to move pallet ${codigo} to ${ubicacion}`);
        // Update the pallet location
        const updatedPallet = await pallets_1.default.update.updatePalletLocation(codigo, ubicacion);
        return (0, response_1.default)(200, "Pallet moved successfully", updatedPallet);
    }
    catch (error) {
        console.error(`❌ Error moving pallet ${codigo}:`, error);
        return (0, response_1.default)(500, error.message);
    }
}
exports.default = movePallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZVBhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2hhbmRsZXJzL21vdmVQYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxRUFBdUQ7QUFDdkQsaUVBQWtEO0FBR2xEOzs7OztHQUtHO0FBQ0gsS0FBSyxVQUFVLFVBQVUsQ0FBQyxNQUFjLEVBQUUsU0FBbUI7SUFDM0QsSUFBSSxDQUFDO1FBQ0gsdUNBQXVDO1FBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLE1BQU0sT0FBTyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRW5FLDZCQUE2QjtRQUM3QixNQUFNLGFBQWEsR0FBRyxNQUFNLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFN0YsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSwyQkFBMkIsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLE1BQU0sR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pELE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUcsS0FBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFELENBQUM7QUFDSCxDQUFDO0FBRUQsa0JBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhbGxldHNDb250cm9sbGVyIGZyb20gJy4uL2NvbnRyb2xsZXJzL3BhbGxldHMnO1xuaW1wb3J0IGNyZWF0ZUFwaVJlc3BvbnNlIGZyb20gJy4uL3V0aWxzL3Jlc3BvbnNlJztcbmltcG9ydCB7IEFwaVJlc3BvbnNlLCBMb2NhdGlvbiB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKiBNb3ZlcyBhIHBhbGxldCB0byBhIG5ldyBsb2NhdGlvblxuICogQHBhcmFtIGNvZGlnbyAtIFRoZSBwYWxsZXQgY29kZVxuICogQHBhcmFtIHViaWNhY2lvbiAtIFRoZSBuZXcgbG9jYXRpb25cbiAqIEByZXR1cm5zIEFQSSByZXNwb25zZVxuICovXG5hc3luYyBmdW5jdGlvbiBtb3ZlUGFsbGV0KGNvZGlnbzogc3RyaW5nLCB1YmljYWNpb246IExvY2F0aW9uKTogUHJvbWlzZTxBcGlSZXNwb25zZT4ge1xuICB0cnkge1xuICAgIC8vIEdldCB0aGUgcGFsbGV0IHRvIGNoZWNrIGlmIGl0IGV4aXN0c1xuICAgIGNvbnNvbGUubG9nKGBBdHRlbXB0aW5nIHRvIG1vdmUgcGFsbGV0ICR7Y29kaWdvfSB0byAke3ViaWNhY2lvbn1gKTtcbiAgICBcbiAgICAvLyBVcGRhdGUgdGhlIHBhbGxldCBsb2NhdGlvblxuICAgIGNvbnN0IHVwZGF0ZWRQYWxsZXQgPSBhd2FpdCBwYWxsZXRzQ29udHJvbGxlci51cGRhdGUudXBkYXRlUGFsbGV0TG9jYXRpb24oY29kaWdvLCB1YmljYWNpb24pO1xuICAgIFxuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiUGFsbGV0IG1vdmVkIHN1Y2Nlc3NmdWxseVwiLCB1cGRhdGVkUGFsbGV0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgbW92aW5nIHBhbGxldCAke2NvZGlnb306YCwgZXJyb3IpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDAsIChlcnJvciBhcyBFcnJvcikubWVzc2FnZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbW92ZVBhbGxldDsgIl19