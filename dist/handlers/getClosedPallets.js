"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const response_1 = __importDefault(require("../utils/response"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
/**
 * Fetch all pallets with estado = "closed" and a given ubicacion (attribute).
 * Example: If you pass "PACKING", only returns closed pallets in PACKING.
 *
 * @param {string} ubicacionValue - e.g. "PACKING"
 * @returns {Promise<object>} API-style response
 */
const getClosedPalletsByUbicacion = async (ubicacionValue) => {
    var _a;
    // Optionally uppercase or sanitize the input
    const location = ubicacionValue.toUpperCase();
    try {
        // We keep #ubicacion as a field name reference in Dynamo,
        // but the actual value is dynamic
        const params = {
            TableName: "Pallets",
            FilterExpression: "#estado = :closed AND #ubicacion = :loc",
            ExpressionAttributeNames: {
                "#estado": "estado",
                "#ubicacion": "ubicacion", // The table attribute name
            },
            ExpressionAttributeValues: {
                ":closed": "closed",
                ":loc": location,
            },
        };
        // Scan for matching items
        const result = await dynamoDB.scan(params).promise();
        // Return success with the found items
        return (0, response_1.default)(200, `✅ Found ${((_a = result.Items) === null || _a === void 0 ? void 0 : _a.length) || 0} closed pallet(s) in ${location}`, result.Items);
    }
    catch (error) {
        // Return error with status 500
        return (0, response_1.default)(500, `❌ Error fetching closed pallets for ubicacion=${ubicacionValue}: ${error.message}`);
    }
};
exports.default = getClosedPalletsByUbicacion;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q2xvc2VkUGFsbGV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2hhbmRsZXJzL2dldENsb3NlZFBhbGxldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBMEI7QUFDMUIsaUVBQWtEO0FBRWxELE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFFbkQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSwyQkFBMkIsR0FBRyxLQUFLLEVBQUUsY0FBc0IsRUFBRSxFQUFFOztJQUNuRSw2Q0FBNkM7SUFDN0MsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBRTlDLElBQUksQ0FBQztRQUNILDBEQUEwRDtRQUMxRCxrQ0FBa0M7UUFDbEMsTUFBTSxNQUFNLEdBQUc7WUFDYixTQUFTLEVBQUUsU0FBUztZQUNwQixnQkFBZ0IsRUFBRSx5Q0FBeUM7WUFDM0Qsd0JBQXdCLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxRQUFRO2dCQUNuQixZQUFZLEVBQUUsV0FBVyxFQUFFLDJCQUEyQjthQUN2RDtZQUNELHlCQUF5QixFQUFFO2dCQUN6QixTQUFTLEVBQUUsUUFBUTtnQkFDbkIsTUFBTSxFQUFFLFFBQVE7YUFDakI7U0FDRixDQUFDO1FBRUYsMEJBQTBCO1FBQzFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVyRCxzQ0FBc0M7UUFDdEMsT0FBTyxJQUFBLGtCQUFpQixFQUN0QixHQUFHLEVBQ0gsV0FBVyxDQUFBLE1BQUEsTUFBTSxDQUFDLEtBQUssMENBQUUsTUFBTSxLQUFJLENBQUMsd0JBQXdCLFFBQVEsRUFBRSxFQUN0RSxNQUFNLENBQUMsS0FBSyxDQUNiLENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQiwrQkFBK0I7UUFDL0IsT0FBTyxJQUFBLGtCQUFpQixFQUN0QixHQUFHLEVBQ0gsaURBQWlELGNBQWMsS0FBSyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQ3BGLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsa0JBQWUsMkJBQTJCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XG5pbXBvcnQgY3JlYXRlQXBpUmVzcG9uc2UgZnJvbSBcIi4uL3V0aWxzL3Jlc3BvbnNlXCI7XG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4vKipcbiAqIEZldGNoIGFsbCBwYWxsZXRzIHdpdGggZXN0YWRvID0gXCJjbG9zZWRcIiBhbmQgYSBnaXZlbiB1YmljYWNpb24gKGF0dHJpYnV0ZSkuXG4gKiBFeGFtcGxlOiBJZiB5b3UgcGFzcyBcIlBBQ0tJTkdcIiwgb25seSByZXR1cm5zIGNsb3NlZCBwYWxsZXRzIGluIFBBQ0tJTkcuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHViaWNhY2lvblZhbHVlIC0gZS5nLiBcIlBBQ0tJTkdcIlxuICogQHJldHVybnMge1Byb21pc2U8b2JqZWN0Pn0gQVBJLXN0eWxlIHJlc3BvbnNlXG4gKi9cbmNvbnN0IGdldENsb3NlZFBhbGxldHNCeVViaWNhY2lvbiA9IGFzeW5jICh1YmljYWNpb25WYWx1ZTogc3RyaW5nKSA9PiB7XG4gIC8vIE9wdGlvbmFsbHkgdXBwZXJjYXNlIG9yIHNhbml0aXplIHRoZSBpbnB1dFxuICBjb25zdCBsb2NhdGlvbiA9IHViaWNhY2lvblZhbHVlLnRvVXBwZXJDYXNlKCk7XG5cbiAgdHJ5IHtcbiAgICAvLyBXZSBrZWVwICN1YmljYWNpb24gYXMgYSBmaWVsZCBuYW1lIHJlZmVyZW5jZSBpbiBEeW5hbW8sXG4gICAgLy8gYnV0IHRoZSBhY3R1YWwgdmFsdWUgaXMgZHluYW1pY1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIFRhYmxlTmFtZTogXCJQYWxsZXRzXCIsXG4gICAgICBGaWx0ZXJFeHByZXNzaW9uOiBcIiNlc3RhZG8gPSA6Y2xvc2VkIEFORCAjdWJpY2FjaW9uID0gOmxvY1wiLFxuICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgIFwiI2VzdGFkb1wiOiBcImVzdGFkb1wiLFxuICAgICAgICBcIiN1YmljYWNpb25cIjogXCJ1YmljYWNpb25cIiwgLy8gVGhlIHRhYmxlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICB9LFxuICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICBcIjpjbG9zZWRcIjogXCJjbG9zZWRcIixcbiAgICAgICAgXCI6bG9jXCI6IGxvY2F0aW9uLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gU2NhbiBmb3IgbWF0Y2hpbmcgaXRlbXNcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkeW5hbW9EQi5zY2FuKHBhcmFtcykucHJvbWlzZSgpO1xuXG4gICAgLy8gUmV0dXJuIHN1Y2Nlc3Mgd2l0aCB0aGUgZm91bmQgaXRlbXNcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoXG4gICAgICAyMDAsXG4gICAgICBg4pyFIEZvdW5kICR7cmVzdWx0Lkl0ZW1zPy5sZW5ndGggfHwgMH0gY2xvc2VkIHBhbGxldChzKSBpbiAke2xvY2F0aW9ufWAsXG4gICAgICByZXN1bHQuSXRlbXNcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgLy8gUmV0dXJuIGVycm9yIHdpdGggc3RhdHVzIDUwMFxuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZShcbiAgICAgIDUwMCxcbiAgICAgIGDinYwgRXJyb3IgZmV0Y2hpbmcgY2xvc2VkIHBhbGxldHMgZm9yIHViaWNhY2lvbj0ke3ViaWNhY2lvblZhbHVlfTogJHtlcnJvci5tZXNzYWdlfWBcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXRDbG9zZWRQYWxsZXRzQnlVYmljYWNpb247XG4iXX0=