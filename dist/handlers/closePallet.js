"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.togglePalletStatus = togglePalletStatus;
const AWS = __importStar(require("aws-sdk"));
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PALLETS_TABLE = "Pallets";
/**
 * Toggles the status of a pallet between 'open' and 'closed'.
 * @param {string} codigo - The code of the pallet to update
 * @returns {Promise<Pallet>} - The updated pallet info
 * @throws {Error} - If the pallet doesn't exist or fails validation
 */
async function togglePalletStatus(codigo) {
    var _a;
    console.log(`📦 Attempting to toggle status of pallet "${codigo}"...`);
    if (!codigo || typeof codigo !== "string") {
        throw new Error("Invalid or missing pallet code.");
    }
    try {
        // 1. Get the current pallet
        const getParams = {
            TableName: PALLETS_TABLE,
            Key: { codigo },
        };
        const getResult = await dynamoDB.get(getParams).promise();
        const pallet = getResult.Item; // Type assertion
        if (!pallet) {
            throw new Error(`Pallet "${codigo}" not found.`);
        }
        // Use nullish coalescing to default to 'open' if estado is missing
        const currentStatus = (_a = pallet.estado) !== null && _a !== void 0 ? _a : 'open';
        const isClosed = currentStatus === 'closed';
        // 2. If closing, validate it has boxes
        // Check if currentStatus is NOT 'closed' (meaning it's 'open' or something else we want to close)
        // And check if cajas is not an array or is an empty array.
        if (!isClosed && (!Array.isArray(pallet.cajas) || pallet.cajas.length === 0)) {
            throw new Error(`Pallet "${codigo}" has no boxes and cannot be closed.`);
        }
        // 3. Determine the new state
        const newStatus = isClosed ? "open" : "closed";
        // 4. Update the pallet's status
        const updateParams = {
            TableName: PALLETS_TABLE,
            Key: { codigo },
            UpdateExpression: "SET estado = :estado",
            ExpressionAttributeValues: {
                ":estado": newStatus,
            },
            ReturnValues: "ALL_NEW", // Request the item's attributes after the update
        };
        const updateResult = await dynamoDB.update(updateParams).promise();
        // Type assert the Attributes property to Pallet
        const updatedPallet = updateResult.Attributes;
        // Ensure updatedPallet is available after the update with ReturnValues: 'ALL_NEW'
        if (!updatedPallet) {
            // This case should ideally not happen with ALL_NEW, but good for robustness
            throw new Error(`Failed to retrieve updated pallet data for "${codigo}".`);
        }
        console.log(`✅ Pallet "${codigo}" updated: ${currentStatus} ➡️ ${newStatus}`);
        return updatedPallet; // Return the updated pallet object
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error(`❌ Error toggling status of pallet "${codigo}":`, error);
        // Re-throw a new error with a more general message for the API layer/caller
        throw new Error(`Failed to toggle pallet status: ${error.message}`);
    }
}
// Export the function for external use
exports.default = togglePalletStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvc2VQYWxsZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9oYW5kbGVycy9jbG9zZVBhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQSxnREFpRUM7QUF6RkQsNkNBQStCO0FBRy9CLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUVuRCxNQUFNLGFBQWEsR0FBVyxTQUFTLENBQUM7QUFheEM7Ozs7O0dBS0c7QUFDSSxLQUFLLFVBQVUsa0JBQWtCLENBQUMsTUFBYzs7SUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsTUFBTSxNQUFNLENBQUMsQ0FBQztJQUV2RSxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzFDLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0gsNEJBQTRCO1FBQzVCLE1BQU0sU0FBUyxHQUFnQztZQUM3QyxTQUFTLEVBQUUsYUFBYTtZQUN4QixHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUU7U0FDaEIsQ0FBQztRQUVGLE1BQU0sU0FBUyxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxRCxNQUFNLE1BQU0sR0FBdUIsU0FBUyxDQUFDLElBQTBCLENBQUMsQ0FBQyxpQkFBaUI7UUFFMUYsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLE1BQU0sY0FBYyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELG1FQUFtRTtRQUNuRSxNQUFNLGFBQWEsR0FBRyxNQUFBLE1BQU0sQ0FBQyxNQUFNLG1DQUFJLE1BQU0sQ0FBQztRQUM5QyxNQUFNLFFBQVEsR0FBRyxhQUFhLEtBQUssUUFBUSxDQUFDO1FBRTVDLHVDQUF1QztRQUN2QyxrR0FBa0c7UUFDbEcsMkRBQTJEO1FBQzNELElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDN0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLE1BQU0sc0NBQXNDLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRUQsNkJBQTZCO1FBQzdCLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFFL0MsZ0NBQWdDO1FBQ2hDLE1BQU0sWUFBWSxHQUFtQztZQUNuRCxTQUFTLEVBQUUsYUFBYTtZQUN4QixHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUU7WUFDZixnQkFBZ0IsRUFBRSxzQkFBc0I7WUFDeEMseUJBQXlCLEVBQUU7Z0JBQ3pCLFNBQVMsRUFBRSxTQUFTO2FBQ3JCO1lBQ0QsWUFBWSxFQUFFLFNBQVMsRUFBRSxpREFBaUQ7U0FDM0UsQ0FBQztRQUVGLE1BQU0sWUFBWSxHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuRSxnREFBZ0Q7UUFDaEQsTUFBTSxhQUFhLEdBQXVCLFlBQVksQ0FBQyxVQUFnQyxDQUFDO1FBRXhGLGtGQUFrRjtRQUNsRixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDaEIsNEVBQTRFO1lBQzVFLE1BQU0sSUFBSSxLQUFLLENBQUMsK0NBQStDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUdELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxNQUFNLGNBQWMsYUFBYSxPQUFPLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFFOUUsT0FBTyxhQUFhLENBQUMsQ0FBQyxtQ0FBbUM7SUFDM0QsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUMsQ0FBQyx1REFBdUQ7UUFDNUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsTUFBTSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkUsNEVBQTRFO1FBQzVFLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7QUFDSCxDQUFDO0FBRUQsdUNBQXVDO0FBQ3ZDLGtCQUFlLGtCQUFrQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XG5pbXBvcnQgeyBEb2N1bWVudENsaWVudCB9IGZyb20gJ2F3cy1zZGsvY2xpZW50cy9keW5hbW9kYic7XG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG5jb25zdCBQQUxMRVRTX1RBQkxFOiBzdHJpbmcgPSBcIlBhbGxldHNcIjtcblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBQYWxsZXQgZGF0YSBzdHJ1Y3R1cmUgaW4gRHluYW1vREIgcmVsZXZhbnQgdG8gdGhpcyBmdW5jdGlvbi5cbiAqL1xuaW50ZXJmYWNlIFBhbGxldCB7XG4gIGNvZGlnbzogc3RyaW5nOyAvLyBQYXJ0aXRpb24gS2V5XG4gIGVzdGFkbzogJ29wZW4nIHwgJ2Nsb3NlZCcgfCBzdHJpbmc7IC8vIEFzc3VtaW5nIGVzdGFkbyBjYW4gYmUgb3RoZXIgc3RyaW5ncyB0b29cbiAgY2FqYXM/OiBzdHJpbmdbXTsgLy8gT3B0aW9uYWwgYXJyYXkgb2YgYm94IGNvZGVzXG4gIC8vIEFkZCBvdGhlciBwYWxsZXQgcHJvcGVydGllcyBpZiBrbm93blxufVxuXG5cbi8qKlxuICogVG9nZ2xlcyB0aGUgc3RhdHVzIG9mIGEgcGFsbGV0IGJldHdlZW4gJ29wZW4nIGFuZCAnY2xvc2VkJy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2RpZ28gLSBUaGUgY29kZSBvZiB0aGUgcGFsbGV0IHRvIHVwZGF0ZVxuICogQHJldHVybnMge1Byb21pc2U8UGFsbGV0Pn0gLSBUaGUgdXBkYXRlZCBwYWxsZXQgaW5mb1xuICogQHRocm93cyB7RXJyb3J9IC0gSWYgdGhlIHBhbGxldCBkb2Vzbid0IGV4aXN0IG9yIGZhaWxzIHZhbGlkYXRpb25cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVBhbGxldFN0YXR1cyhjb2RpZ286IHN0cmluZyk6IFByb21pc2U8UGFsbGV0PiB7XG4gIGNvbnNvbGUubG9nKGDwn5OmIEF0dGVtcHRpbmcgdG8gdG9nZ2xlIHN0YXR1cyBvZiBwYWxsZXQgXCIke2NvZGlnb31cIi4uLmApO1xuXG4gIGlmICghY29kaWdvIHx8IHR5cGVvZiBjb2RpZ28gIT09IFwic3RyaW5nXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG9yIG1pc3NpbmcgcGFsbGV0IGNvZGUuXCIpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyAxLiBHZXQgdGhlIGN1cnJlbnQgcGFsbGV0XG4gICAgY29uc3QgZ2V0UGFyYW1zOiBEb2N1bWVudENsaWVudC5HZXRJdGVtSW5wdXQgPSB7XG4gICAgICBUYWJsZU5hbWU6IFBBTExFVFNfVEFCTEUsXG4gICAgICBLZXk6IHsgY29kaWdvIH0sXG4gICAgfTtcblxuICAgIGNvbnN0IGdldFJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLmdldChnZXRQYXJhbXMpLnByb21pc2UoKTtcbiAgICBjb25zdCBwYWxsZXQ6IFBhbGxldCB8IHVuZGVmaW5lZCA9IGdldFJlc3VsdC5JdGVtIGFzIFBhbGxldCB8IHVuZGVmaW5lZDsgLy8gVHlwZSBhc3NlcnRpb25cblxuICAgIGlmICghcGFsbGV0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFBhbGxldCBcIiR7Y29kaWdvfVwiIG5vdCBmb3VuZC5gKTtcbiAgICB9XG5cbiAgICAvLyBVc2UgbnVsbGlzaCBjb2FsZXNjaW5nIHRvIGRlZmF1bHQgdG8gJ29wZW4nIGlmIGVzdGFkbyBpcyBtaXNzaW5nXG4gICAgY29uc3QgY3VycmVudFN0YXR1cyA9IHBhbGxldC5lc3RhZG8gPz8gJ29wZW4nO1xuICAgIGNvbnN0IGlzQ2xvc2VkID0gY3VycmVudFN0YXR1cyA9PT0gJ2Nsb3NlZCc7XG5cbiAgICAvLyAyLiBJZiBjbG9zaW5nLCB2YWxpZGF0ZSBpdCBoYXMgYm94ZXNcbiAgICAvLyBDaGVjayBpZiBjdXJyZW50U3RhdHVzIGlzIE5PVCAnY2xvc2VkJyAobWVhbmluZyBpdCdzICdvcGVuJyBvciBzb21ldGhpbmcgZWxzZSB3ZSB3YW50IHRvIGNsb3NlKVxuICAgIC8vIEFuZCBjaGVjayBpZiBjYWphcyBpcyBub3QgYW4gYXJyYXkgb3IgaXMgYW4gZW1wdHkgYXJyYXkuXG4gICAgaWYgKCFpc0Nsb3NlZCAmJiAoIUFycmF5LmlzQXJyYXkocGFsbGV0LmNhamFzKSB8fCBwYWxsZXQuY2FqYXMubGVuZ3RoID09PSAwKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQYWxsZXQgXCIke2NvZGlnb31cIiBoYXMgbm8gYm94ZXMgYW5kIGNhbm5vdCBiZSBjbG9zZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gMy4gRGV0ZXJtaW5lIHRoZSBuZXcgc3RhdGVcbiAgICBjb25zdCBuZXdTdGF0dXMgPSBpc0Nsb3NlZCA/IFwib3BlblwiIDogXCJjbG9zZWRcIjtcblxuICAgIC8vIDQuIFVwZGF0ZSB0aGUgcGFsbGV0J3Mgc3RhdHVzXG4gICAgY29uc3QgdXBkYXRlUGFyYW1zOiBEb2N1bWVudENsaWVudC5VcGRhdGVJdGVtSW5wdXQgPSB7XG4gICAgICBUYWJsZU5hbWU6IFBBTExFVFNfVEFCTEUsXG4gICAgICBLZXk6IHsgY29kaWdvIH0sXG4gICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlNFVCBlc3RhZG8gPSA6ZXN0YWRvXCIsXG4gICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgIFwiOmVzdGFkb1wiOiBuZXdTdGF0dXMsXG4gICAgICB9LFxuICAgICAgUmV0dXJuVmFsdWVzOiBcIkFMTF9ORVdcIiwgLy8gUmVxdWVzdCB0aGUgaXRlbSdzIGF0dHJpYnV0ZXMgYWZ0ZXIgdGhlIHVwZGF0ZVxuICAgIH07XG5cbiAgICBjb25zdCB1cGRhdGVSZXN1bHQgPSBhd2FpdCBkeW5hbW9EQi51cGRhdGUodXBkYXRlUGFyYW1zKS5wcm9taXNlKCk7XG4gICAgLy8gVHlwZSBhc3NlcnQgdGhlIEF0dHJpYnV0ZXMgcHJvcGVydHkgdG8gUGFsbGV0XG4gICAgY29uc3QgdXBkYXRlZFBhbGxldDogUGFsbGV0IHwgdW5kZWZpbmVkID0gdXBkYXRlUmVzdWx0LkF0dHJpYnV0ZXMgYXMgUGFsbGV0IHwgdW5kZWZpbmVkO1xuXG4gICAgLy8gRW5zdXJlIHVwZGF0ZWRQYWxsZXQgaXMgYXZhaWxhYmxlIGFmdGVyIHRoZSB1cGRhdGUgd2l0aCBSZXR1cm5WYWx1ZXM6ICdBTExfTkVXJ1xuICAgIGlmICghdXBkYXRlZFBhbGxldCkge1xuICAgICAgICAgLy8gVGhpcyBjYXNlIHNob3VsZCBpZGVhbGx5IG5vdCBoYXBwZW4gd2l0aCBBTExfTkVXLCBidXQgZ29vZCBmb3Igcm9idXN0bmVzc1xuICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcmV0cmlldmUgdXBkYXRlZCBwYWxsZXQgZGF0YSBmb3IgXCIke2NvZGlnb31cIi5gKTtcbiAgICB9XG5cblxuICAgIGNvbnNvbGUubG9nKGDinIUgUGFsbGV0IFwiJHtjb2RpZ299XCIgdXBkYXRlZDogJHtjdXJyZW50U3RhdHVzfSDinqHvuI8gJHtuZXdTdGF0dXN9YCk7XG5cbiAgICByZXR1cm4gdXBkYXRlZFBhbGxldDsgLy8gUmV0dXJuIHRoZSB1cGRhdGVkIHBhbGxldCBvYmplY3RcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkgeyAvLyBVc2UgJ2FueScgZm9yIGJyb2FkZXIgY29tcGF0aWJpbGl0eSB3aXRoIGVycm9yIHR5cGVzXG4gICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yIHRvZ2dsaW5nIHN0YXR1cyBvZiBwYWxsZXQgXCIke2NvZGlnb31cIjpgLCBlcnJvcik7XG4gICAgLy8gUmUtdGhyb3cgYSBuZXcgZXJyb3Igd2l0aCBhIG1vcmUgZ2VuZXJhbCBtZXNzYWdlIGZvciB0aGUgQVBJIGxheWVyL2NhbGxlclxuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHRvZ2dsZSBwYWxsZXQgc3RhdHVzOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gIH1cbn1cblxuLy8gRXhwb3J0IHRoZSBmdW5jdGlvbiBmb3IgZXh0ZXJuYWwgdXNlXG5leHBvcnQgZGVmYXVsdCB0b2dnbGVQYWxsZXRTdGF0dXM7Il19