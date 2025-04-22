"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoxesByLocation = getBoxesByLocation;
exports.getBoxesByDate = getBoxesByDate;
exports.getAllBoxes = getAllBoxes;
exports.getUnassignedBoxesInPacking = getUnassignedBoxesInPacking;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Box_1 = __importDefault(require("../../models/Box"));
const SystemConfig_1 = __importDefault(require("../../models/SystemConfig"));
const db_1 = __importDefault(require("../../utils/db"));
const response_1 = __importDefault(require("../../utils/response"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
/**
 * Get boxes by location
 * @param {string} location - Location to filter by
 * @returns {Promise<ApiResponse>} API response
 */
async function getBoxesByLocation(location) {
    try {
        const boxes = await db_1.default.scanItems(Box_1.default.getTableName(), 'ubicacion = :location', { ':location': location });
        return (0, response_1.default)(200, "Boxes fetched successfully", boxes);
    }
    catch (error) {
        console.error('❌ Error retrieving boxes by location:', error);
        return (0, response_1.default)(500, `Error retrieving boxes: ${error.message}`);
    }
}
/**
 * Get boxes by date
 * @param {string} date - The date to filter by (YYYYMMDD format)
 * @returns {Promise<ApiResponse>} API response
 */
async function getBoxesByDate(date) {
    try {
        // Assuming the box code starts with the date in format YYYYMMDD
        const boxes = await db_1.default.scanItems(Box_1.default.getTableName(), 'begins_with(codigo, :date)', { ':date': date });
        return (0, response_1.default)(200, "Boxes by date fetched successfully", boxes);
    }
    catch (error) {
        console.error(`❌ Error retrieving boxes for date ${date}:`, error);
        return (0, response_1.default)(500, `Error retrieving boxes: ${error.message}`);
    }
}
/**
 * Get all boxes
 * @returns {Promise<ApiResponse>} API response
 */
async function getAllBoxes() {
    try {
        const boxes = await db_1.default.scanItems(Box_1.default.getTableName());
        return (0, response_1.default)(200, "All boxes fetched successfully", boxes);
    }
    catch (error) {
        console.error('❌ Error retrieving all boxes:', error);
        return (0, response_1.default)(500, `Error retrieving boxes: ${error.message}`);
    }
}
/**
 * Get unassigned boxes in packing
 * @returns {Promise<ApiResponse>} API response
 */
async function getUnassignedBoxesInPacking() {
    try {
        const boxes = await db_1.default.scanItems(Box_1.default.getTableName(), 'ubicacion = :location AND attribute_not_exists(palletId)', { ':location': SystemConfig_1.default.getLocations().PACKING });
        return (0, response_1.default)(200, "Unassigned boxes in packing fetched successfully", boxes);
    }
    catch (error) {
        console.error('❌ Error retrieving unassigned boxes in packing:', error);
        return (0, response_1.default)(500, `Error retrieving unassigned boxes: ${error.message}`);
    }
}
exports.default = {
    getUnassignedBoxesInPacking,
    getBoxesByLocation,
    getAllBoxes,
    getBoxesByDate
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbnRyb2xsZXJzL2JveGVzL3JlYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFjQSxnREFZQztBQU9ELHdDQWFDO0FBTUQsa0NBUUM7QUFNRCxrRUFZQztBQTlFRCxzREFBMEI7QUFFMUIsMkRBQW1DO0FBQ25DLDZFQUFxRDtBQUNyRCx3REFBcUM7QUFDckMsb0VBQXFEO0FBRXJELE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFFbkQ7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxRQUFnQjtJQUN2RCxJQUFJLENBQUM7UUFDSCxNQUFNLEtBQUssR0FBRyxNQUFNLFlBQU8sQ0FBQyxTQUFTLENBQ25DLGFBQUcsQ0FBQyxZQUFZLEVBQUUsRUFDbEIsdUJBQXVCLEVBQ3ZCLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUMxQixDQUFDO1FBQ0YsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSwyQkFBNEIsS0FBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDdkYsQ0FBQztBQUNILENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLGNBQWMsQ0FBQyxJQUFZO0lBQy9DLElBQUksQ0FBQztRQUNILGdFQUFnRTtRQUNoRSxNQUFNLEtBQUssR0FBRyxNQUFNLFlBQU8sQ0FBQyxTQUFTLENBQ25DLGFBQUcsQ0FBQyxZQUFZLEVBQUUsRUFDbEIsNEJBQTRCLEVBQzVCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUNsQixDQUFDO1FBQ0YsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxvQ0FBb0MsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ25FLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsMkJBQTRCLEtBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLFdBQVc7SUFDL0IsSUFBSSxDQUFDO1FBQ0gsTUFBTSxLQUFLLEdBQUcsTUFBTSxZQUFPLENBQUMsU0FBUyxDQUFDLGFBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQzFELE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsZ0NBQWdDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RELE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsMkJBQTRCLEtBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLDJCQUEyQjtJQUMvQyxJQUFJLENBQUM7UUFDSCxNQUFNLEtBQUssR0FBRyxNQUFNLFlBQU8sQ0FBQyxTQUFTLENBQ25DLGFBQUcsQ0FBQyxZQUFZLEVBQUUsRUFDbEIsMERBQTBELEVBQzFELEVBQUUsV0FBVyxFQUFFLHNCQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQ3JELENBQUM7UUFDRixPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLGtEQUFrRCxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxpREFBaUQsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RSxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLHNDQUF1QyxLQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNsRyxDQUFDO0FBQ0gsQ0FBQztBQUVELGtCQUFlO0lBQ2IsMkJBQTJCO0lBQzNCLGtCQUFrQjtJQUNsQixXQUFXO0lBQ1gsY0FBYztDQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHsgQXBpUmVzcG9uc2UgfSBmcm9tICcuLi8uLi90eXBlcyc7XG5pbXBvcnQgQm94IGZyb20gJy4uLy4uL21vZGVscy9Cb3gnO1xuaW1wb3J0IFN5c3RlbUNvbmZpZyBmcm9tICcuLi8uLi9tb2RlbHMvU3lzdGVtQ29uZmlnJztcbmltcG9ydCBkYlV0aWxzIGZyb20gJy4uLy4uL3V0aWxzL2RiJztcbmltcG9ydCBjcmVhdGVBcGlSZXNwb25zZSBmcm9tICcuLi8uLi91dGlscy9yZXNwb25zZSc7XG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4vKipcbiAqIEdldCBib3hlcyBieSBsb2NhdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IGxvY2F0aW9uIC0gTG9jYXRpb24gdG8gZmlsdGVyIGJ5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcGlSZXNwb25zZT59IEFQSSByZXNwb25zZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Qm94ZXNCeUxvY2F0aW9uKGxvY2F0aW9uOiBzdHJpbmcpOiBQcm9taXNlPEFwaVJlc3BvbnNlPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYm94ZXMgPSBhd2FpdCBkYlV0aWxzLnNjYW5JdGVtcyhcbiAgICAgIEJveC5nZXRUYWJsZU5hbWUoKSxcbiAgICAgICd1YmljYWNpb24gPSA6bG9jYXRpb24nLFxuICAgICAgeyAnOmxvY2F0aW9uJzogbG9jYXRpb24gfVxuICAgICk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgXCJCb3hlcyBmZXRjaGVkIHN1Y2Nlc3NmdWxseVwiLCBib3hlcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcign4p2MIEVycm9yIHJldHJpZXZpbmcgYm94ZXMgYnkgbG9jYXRpb246JywgZXJyb3IpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDAsIGBFcnJvciByZXRyaWV2aW5nIGJveGVzOiAkeyhlcnJvciBhcyBFcnJvcikubWVzc2FnZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCBib3hlcyBieSBkYXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0ZSAtIFRoZSBkYXRlIHRvIGZpbHRlciBieSAoWVlZWU1NREQgZm9ybWF0KVxuICogQHJldHVybnMge1Byb21pc2U8QXBpUmVzcG9uc2U+fSBBUEkgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEJveGVzQnlEYXRlKGRhdGU6IHN0cmluZyk6IFByb21pc2U8QXBpUmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICAvLyBBc3N1bWluZyB0aGUgYm94IGNvZGUgc3RhcnRzIHdpdGggdGhlIGRhdGUgaW4gZm9ybWF0IFlZWVlNTUREXG4gICAgY29uc3QgYm94ZXMgPSBhd2FpdCBkYlV0aWxzLnNjYW5JdGVtcyhcbiAgICAgIEJveC5nZXRUYWJsZU5hbWUoKSxcbiAgICAgICdiZWdpbnNfd2l0aChjb2RpZ28sIDpkYXRlKScsXG4gICAgICB7ICc6ZGF0ZSc6IGRhdGUgfVxuICAgICk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgXCJCb3hlcyBieSBkYXRlIGZldGNoZWQgc3VjY2Vzc2Z1bGx5XCIsIGJveGVzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgcmV0cmlldmluZyBib3hlcyBmb3IgZGF0ZSAke2RhdGV9OmAsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBgRXJyb3IgcmV0cmlldmluZyBib3hlczogJHsoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgYWxsIGJveGVzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcGlSZXNwb25zZT59IEFQSSByZXNwb25zZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsQm94ZXMoKTogUHJvbWlzZTxBcGlSZXNwb25zZT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGJveGVzID0gYXdhaXQgZGJVdGlscy5zY2FuSXRlbXMoQm94LmdldFRhYmxlTmFtZSgpKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBcIkFsbCBib3hlcyBmZXRjaGVkIHN1Y2Nlc3NmdWxseVwiLCBib3hlcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcign4p2MIEVycm9yIHJldHJpZXZpbmcgYWxsIGJveGVzOicsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBgRXJyb3IgcmV0cmlldmluZyBib3hlczogJHsoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgdW5hc3NpZ25lZCBib3hlcyBpbiBwYWNraW5nXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcGlSZXNwb25zZT59IEFQSSByZXNwb25zZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VW5hc3NpZ25lZEJveGVzSW5QYWNraW5nKCk6IFByb21pc2U8QXBpUmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBib3hlcyA9IGF3YWl0IGRiVXRpbHMuc2Nhbkl0ZW1zKFxuICAgICAgQm94LmdldFRhYmxlTmFtZSgpLFxuICAgICAgJ3ViaWNhY2lvbiA9IDpsb2NhdGlvbiBBTkQgYXR0cmlidXRlX25vdF9leGlzdHMocGFsbGV0SWQpJyxcbiAgICAgIHsgJzpsb2NhdGlvbic6IFN5c3RlbUNvbmZpZy5nZXRMb2NhdGlvbnMoKS5QQUNLSU5HIH1cbiAgICApO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiVW5hc3NpZ25lZCBib3hlcyBpbiBwYWNraW5nIGZldGNoZWQgc3VjY2Vzc2Z1bGx5XCIsIGJveGVzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgcmV0cmlldmluZyB1bmFzc2lnbmVkIGJveGVzIGluIHBhY2tpbmc6JywgZXJyb3IpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDAsIGBFcnJvciByZXRyaWV2aW5nIHVuYXNzaWduZWQgYm94ZXM6ICR7KGVycm9yIGFzIEVycm9yKS5tZXNzYWdlfWApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZ2V0VW5hc3NpZ25lZEJveGVzSW5QYWNraW5nLFxuICBnZXRCb3hlc0J5TG9jYXRpb24sXG4gIGdldEFsbEJveGVzLFxuICBnZXRCb3hlc0J5RGF0ZVxufTsgIl19