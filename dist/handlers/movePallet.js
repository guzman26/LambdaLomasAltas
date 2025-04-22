"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Pallet_1 = __importDefault(require("../models/Pallet"));
const SystemConfig_1 = __importDefault(require("../models/SystemConfig"));
const db_1 = __importDefault(require("../utils/db"));
const response_1 = __importDefault(require("../utils/response"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
/**
 * Moves a pallet to a new location
 *
 * @param {string} codigo - The pallet code
 * @param {Location} ubicacion - The new location
 * @returns {Promise<ApiResponse>} API response
 */
async function movePallet(codigo, ubicacion) {
    try {
        // Validate that the pallet exists
        const pallet = await db_1.default.getItem(Pallet_1.default.getTableName(), { codigo });
        if (!pallet) {
            return (0, response_1.default)(404, `Pallet with code ${codigo} not found`);
        }
        // Check if requested location is valid
        const validLocations = Object.values(SystemConfig_1.default.getLocations());
        if (!validLocations.includes(ubicacion)) {
            return (0, response_1.default)(400, `Invalid location: ${ubicacion}. Valid options: ${validLocations.join(', ')}`);
        }
        // Pallets cannot be moved to PACKING
        if (ubicacion === SystemConfig_1.default.getLocations().PACKING) {
            return (0, response_1.default)(400, 'Pallets cannot be moved to PACKING directly');
        }
        // Update pallet location
        const updatedPallet = await db_1.default.updateItem(Pallet_1.default.getTableName(), { codigo }, 'SET ubicacion = :ubicacion, ultimaActualizacion = :timestamp', {
            ':ubicacion': ubicacion,
            ':timestamp': new Date().toISOString()
        });
        return (0, response_1.default)(200, `Pallet ${codigo} moved to ${ubicacion} successfully`, updatedPallet);
    }
    catch (error) {
        console.error(`Error moving pallet ${codigo} to ${ubicacion}:`, error);
        return (0, response_1.default)(500, `Error moving pallet: ${error.message}`);
    }
}
exports.default = movePallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZVBhbGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2hhbmRsZXJzL21vdmVQYWxsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBMEI7QUFFMUIsOERBQTJDO0FBQzNDLDBFQUFrRDtBQUNsRCxxREFBa0M7QUFDbEMsaUVBQWtEO0FBRWxELE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFFbkQ7Ozs7OztHQU1HO0FBQ0gsS0FBSyxVQUFVLFVBQVUsQ0FDdkIsTUFBYyxFQUNkLFNBQW1CO0lBRW5CLElBQUksQ0FBQztRQUNILGtDQUFrQztRQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQVcsQ0FBQyxZQUFZLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFN0UsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1osT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxvQkFBb0IsTUFBTSxZQUFZLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsdUNBQXVDO1FBQ3ZDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDeEMsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxxQkFBcUIsU0FBUyxvQkFBb0IsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0csQ0FBQztRQUVELHFDQUFxQztRQUNyQyxJQUFJLFNBQVMsS0FBSyxzQkFBWSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RELE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQseUJBQXlCO1FBQ3pCLE1BQU0sYUFBYSxHQUFHLE1BQU0sWUFBTyxDQUFDLFVBQVUsQ0FDNUMsZ0JBQVcsQ0FBQyxZQUFZLEVBQUUsRUFDMUIsRUFBRSxNQUFNLEVBQUUsRUFDViw4REFBOEQsRUFDOUQ7WUFDRSxZQUFZLEVBQUUsU0FBUztZQUN2QixZQUFZLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDdkMsQ0FDRixDQUFDO1FBRUYsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxVQUFVLE1BQU0sYUFBYSxTQUFTLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLE1BQU0sT0FBTyxTQUFTLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2RSxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLHdCQUF5QixLQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNwRixDQUFDO0FBQ0gsQ0FBQztBQUVELGtCQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgeyBBcGlSZXNwb25zZSwgTG9jYXRpb24gfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgUGFsbGV0TW9kZWwgZnJvbSAnLi4vbW9kZWxzL1BhbGxldCc7XG5pbXBvcnQgU3lzdGVtQ29uZmlnIGZyb20gJy4uL21vZGVscy9TeXN0ZW1Db25maWcnO1xuaW1wb3J0IGRiVXRpbHMgZnJvbSAnLi4vdXRpbHMvZGInO1xuaW1wb3J0IGNyZWF0ZUFwaVJlc3BvbnNlIGZyb20gJy4uL3V0aWxzL3Jlc3BvbnNlJztcblxuY29uc3QgZHluYW1vREIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbi8qKlxuICogTW92ZXMgYSBwYWxsZXQgdG8gYSBuZXcgbG9jYXRpb25cbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IGNvZGlnbyAtIFRoZSBwYWxsZXQgY29kZVxuICogQHBhcmFtIHtMb2NhdGlvbn0gdWJpY2FjaW9uIC0gVGhlIG5ldyBsb2NhdGlvblxuICogQHJldHVybnMge1Byb21pc2U8QXBpUmVzcG9uc2U+fSBBUEkgcmVzcG9uc2VcbiAqL1xuYXN5bmMgZnVuY3Rpb24gbW92ZVBhbGxldChcbiAgY29kaWdvOiBzdHJpbmcsIFxuICB1YmljYWNpb246IExvY2F0aW9uXG4pOiBQcm9taXNlPEFwaVJlc3BvbnNlPiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgcGFsbGV0IGV4aXN0c1xuICAgIGNvbnN0IHBhbGxldCA9IGF3YWl0IGRiVXRpbHMuZ2V0SXRlbShQYWxsZXRNb2RlbC5nZXRUYWJsZU5hbWUoKSwgeyBjb2RpZ28gfSk7XG4gICAgXG4gICAgaWYgKCFwYWxsZXQpIHtcbiAgICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg0MDQsIGBQYWxsZXQgd2l0aCBjb2RlICR7Y29kaWdvfSBub3QgZm91bmRgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gQ2hlY2sgaWYgcmVxdWVzdGVkIGxvY2F0aW9uIGlzIHZhbGlkXG4gICAgY29uc3QgdmFsaWRMb2NhdGlvbnMgPSBPYmplY3QudmFsdWVzKFN5c3RlbUNvbmZpZy5nZXRMb2NhdGlvbnMoKSk7XG4gICAgaWYgKCF2YWxpZExvY2F0aW9ucy5pbmNsdWRlcyh1YmljYWNpb24pKSB7XG4gICAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNDAwLCBgSW52YWxpZCBsb2NhdGlvbjogJHt1YmljYWNpb259LiBWYWxpZCBvcHRpb25zOiAke3ZhbGlkTG9jYXRpb25zLmpvaW4oJywgJyl9YCk7XG4gICAgfVxuICAgIFxuICAgIC8vIFBhbGxldHMgY2Fubm90IGJlIG1vdmVkIHRvIFBBQ0tJTkdcbiAgICBpZiAodWJpY2FjaW9uID09PSBTeXN0ZW1Db25maWcuZ2V0TG9jYXRpb25zKCkuUEFDS0lORykge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwMCwgJ1BhbGxldHMgY2Fubm90IGJlIG1vdmVkIHRvIFBBQ0tJTkcgZGlyZWN0bHknKTtcbiAgICB9XG4gICAgXG4gICAgLy8gVXBkYXRlIHBhbGxldCBsb2NhdGlvblxuICAgIGNvbnN0IHVwZGF0ZWRQYWxsZXQgPSBhd2FpdCBkYlV0aWxzLnVwZGF0ZUl0ZW0oXG4gICAgICBQYWxsZXRNb2RlbC5nZXRUYWJsZU5hbWUoKSxcbiAgICAgIHsgY29kaWdvIH0sXG4gICAgICAnU0VUIHViaWNhY2lvbiA9IDp1YmljYWNpb24sIHVsdGltYUFjdHVhbGl6YWNpb24gPSA6dGltZXN0YW1wJyxcbiAgICAgIHtcbiAgICAgICAgJzp1YmljYWNpb24nOiB1YmljYWNpb24sXG4gICAgICAgICc6dGltZXN0YW1wJzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9XG4gICAgKTtcbiAgICBcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBgUGFsbGV0ICR7Y29kaWdvfSBtb3ZlZCB0byAke3ViaWNhY2lvbn0gc3VjY2Vzc2Z1bGx5YCwgdXBkYXRlZFBhbGxldCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgbW92aW5nIHBhbGxldCAke2NvZGlnb30gdG8gJHt1YmljYWNpb259OmAsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBgRXJyb3IgbW92aW5nIHBhbGxldDogJHsoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2V9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbW92ZVBhbGxldDsgIl19