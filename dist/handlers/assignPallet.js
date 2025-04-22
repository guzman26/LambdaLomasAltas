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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPallet = assignPallet;
const AWS = __importStar(require("aws-sdk"));
// Assuming createPallet is also converted to TypeScript and exports the function
const create_1 = __importDefault(require("../controllers/pallets/create")); // Adjust path if necessary
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PALLETS_TABLE = "Pallets";
/**
 * Parses a pallet code string into its components
 * @param {string} code - Pallet code to parse with format DSSYYHFNN... where:
 * D: day of week (1 digit)
 * SS: week of year (2 digits)
 * YY: year (2 digits)
 * H: shift (1 digit)
 * CC: caliber (2 digits)
 * F: format (1 digit)
 * N: pallet number (variable length)
 * @returns {ParsedPalletCode} Parsed pallet code components
 * @throws {Error} If code format is invalid
 */
function parsePalletCode(code) {
    // Ensure code is a string and has the minimum required length for fixed parts
    if (typeof code !== 'string' || code.length < 9) {
        throw new Error(`Invalid pallet code format or length: "${code}"`);
    }
    const dayOfWeek = code.substring(0, 1);
    const weekOfYear = code.substring(1, 3);
    const year = code.substring(3, 5);
    const shift = code.substring(5, 6);
    const caliber = code.substring(6, 8);
    const format = code.substring(8, 9);
    const palletNumber = code.substring(9); // Rest of the string is the pallet number
    // Optional: Add validation for the format of extracted components if needed
    // e.g., check if dayOfWeek is 1-7, weekOfYear 01-53, year is digits, etc.
    // For simplicity, sticking to string extraction as in original JS.
    return {
        dayOfWeek,
        weekOfYear,
        year,
        shift,
        caliber,
        format,
        palletNumber
    };
}
/**
 * Retrieves or creates a pallet in the database
 * @param {string} palletCode - Code identifying the pallet
 * @param {string} [ubicacion="PACKING"] - The initial location if creating a new pallet
 * @returns {Promise<Pallet>} The pallet object (existing or newly created)
 * @throws {Error} If pallet retrieval or creation fails
 */
async function assignPallet(palletCode, ubicacion = "PACKING") {
    console.log(`🔍 Checking for pallet with code: "${palletCode}"`);
    // Validate palletCode is a non-empty string
    if (typeof palletCode !== 'string' || palletCode.length === 0) {
        throw new Error(`Pallet code must be a non-empty string, received: ${typeof palletCode}`);
    }
    try {
        // Parse the pallet code to validate format before DB operation
        // This will throw an error if the code is too short or not a string, as per parsePalletCode logic
        parsePalletCode(palletCode);
        // Attempt to retrieve existing pallet
        const params = {
            TableName: PALLETS_TABLE,
            Key: { codigo: palletCode },
        };
        const getResult = await dynamoDB.get(params).promise();
        let pallet = getResult.Item; // Type assertion
        // Create a new pallet if not found
        if (!pallet) {
            console.log(`✨ Pallet "${palletCode}" not found. Creating new pallet.`);
            // Call the createPallet function and await its result
            // createPallet returns an ApiResponse, we need to extract the pallet data from it
            const response = await (0, create_1.default)(palletCode);
            // Extract the pallet data from the ApiResponse
            const responseBody = JSON.parse(response.body);
            if (responseBody.status === 'success' && responseBody.data) {
                pallet = responseBody.data;
            }
            else {
                throw new Error(`Failed to create pallet: ${responseBody.message}`);
            }
            console.log(`✅ New pallet created: ${JSON.stringify(pallet)}`);
        }
        else {
            console.log(`✅ Found existing pallet: ${JSON.stringify(pallet)}`);
        }
        // After finding or creating, ensure a pallet object is available
        if (!pallet) {
            // This case should ideally not happen if createPallet is implemented correctly,
            // but serves as a safeguard.
            throw new Error(`Failed to retrieve or create pallet with code "${palletCode}".`);
        }
        return pallet; // Return the found or newly created pallet
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error("❌ Error during pallet assignment:", error);
        // Re-throw a new error with a more general message for the API layer/caller
        throw new Error(`Failed to get or create pallet: ${error.message}`);
    }
}
// Export the function for external use
exports.default = assignPallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWduUGFsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vaGFuZGxlcnMvYXNzaWduUGFsbGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0ZBLG9DQXNEQztBQTlJRCw2Q0FBK0I7QUFHL0IsaUZBQWlGO0FBQ2pGLDJFQUF5RCxDQUFDLDJCQUEyQjtBQUVyRixNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFFbkQsTUFBTSxhQUFhLEdBQVcsU0FBUyxDQUFDO0FBOEJ4Qzs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxTQUFTLGVBQWUsQ0FBQyxJQUFZO0lBQ2pDLDhFQUE4RTtJQUM5RSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzlDLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLElBQUksR0FBRyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FB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RCx1Q0FBdUM7QUFDdkMsa0JBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XG5pbXBvcnQgeyBEb2N1bWVudENsaWVudCB9IGZyb20gJ2F3cy1zZGsvY2xpZW50cy9keW5hbW9kYic7XG5cbi8vIEFzc3VtaW5nIGNyZWF0ZVBhbGxldCBpcyBhbHNvIGNvbnZlcnRlZCB0byBUeXBlU2NyaXB0IGFuZCBleHBvcnRzIHRoZSBmdW5jdGlvblxuaW1wb3J0IGNyZWF0ZVBhbGxldCBmcm9tIFwiLi4vY29udHJvbGxlcnMvcGFsbGV0cy9jcmVhdGVcIjsgLy8gQWRqdXN0IHBhdGggaWYgbmVjZXNzYXJ5XG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG5jb25zdCBQQUxMRVRTX1RBQkxFOiBzdHJpbmcgPSBcIlBhbGxldHNcIjtcblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBwYXJzZWQgcGFsbGV0IGNvZGUgY29tcG9uZW50cy5cbiAqL1xuaW50ZXJmYWNlIFBhcnNlZFBhbGxldENvZGUge1xuICAgIGRheU9mV2Vlazogc3RyaW5nO1xuICAgIHdlZWtPZlllYXI6IHN0cmluZztcbiAgICB5ZWFyOiBzdHJpbmc7XG4gICAgc2hpZnQ6IHN0cmluZztcbiAgICBjYWxpYmVyOiBzdHJpbmc7XG4gICAgZm9ybWF0OiBzdHJpbmc7XG4gICAgcGFsbGV0TnVtYmVyOiBzdHJpbmc7IC8vIENhbiBiZSB2YXJpYWJsZSBsZW5ndGhcbn1cblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBQYWxsZXQgZGF0YSBzdHJ1Y3R1cmUgaW4gRHluYW1vREIuXG4gKi9cbmludGVyZmFjZSBQYWxsZXQge1xuICAgIGNvZGlnbzogc3RyaW5nOyAvLyBQYXJ0aXRpb24gS2V5XG4gICAgdWJpY2FjaW9uOiBzdHJpbmc7IC8vIGUuZy4sIFwiUEFDS0lOR1wiLCBcIkJPREVHQVwiLCBcIlZFTlRBXCJcbiAgICBlc3RhZG86ICdvcGVuJyB8ICdjbG9zZWQnIHwgc3RyaW5nOyAvLyBBZGQgb3RoZXIgc3RhdGVzIGlmIGFwcGxpY2FibGVcbiAgICBjYW50aWRhZENhamFzOiBudW1iZXI7XG4gICAgY2FqYXM/OiBzdHJpbmdbXTsgLy8gQXJyYXkgb2YgYm94IGNvZGVzXG4gICAgY3JlYXRlZEF0OiBzdHJpbmc7IC8vIElTTyA4NjAxIHN0cmluZ1xuICAgIHVwZGF0ZWRBdD86IHN0cmluZzsgLy8gSVNPIDg2MDEgc3RyaW5nXG4gICAgLy8gQWRkIG90aGVyIHBhbGxldCBwcm9wZXJ0aWVzIGlmIGtub3duXG59XG5cblxuLyoqXG4gKiBQYXJzZXMgYSBwYWxsZXQgY29kZSBzdHJpbmcgaW50byBpdHMgY29tcG9uZW50c1xuICogQHBhcmFtIHtzdHJpbmd9IGNvZGUgLSBQYWxsZXQgY29kZSB0byBwYXJzZSB3aXRoIGZvcm1hdCBEU1NZWUhGTk4uLi4gd2hlcmU6XG4gKiBEOiBkYXkgb2Ygd2VlayAoMSBkaWdpdClcbiAqIFNTOiB3ZWVrIG9mIHllYXIgKDIgZGlnaXRzKVxuICogWVk6IHllYXIgKDIgZGlnaXRzKVxuICogSDogc2hpZnQgKDEgZGlnaXQpXG4gKiBDQzogY2FsaWJlciAoMiBkaWdpdHMpXG4gKiBGOiBmb3JtYXQgKDEgZGlnaXQpXG4gKiBOOiBwYWxsZXQgbnVtYmVyICh2YXJpYWJsZSBsZW5ndGgpXG4gKiBAcmV0dXJucyB7UGFyc2VkUGFsbGV0Q29kZX0gUGFyc2VkIHBhbGxldCBjb2RlIGNvbXBvbmVudHNcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBjb2RlIGZvcm1hdCBpcyBpbnZhbGlkXG4gKi9cbmZ1bmN0aW9uIHBhcnNlUGFsbGV0Q29kZShjb2RlOiBzdHJpbmcpOiBQYXJzZWRQYWxsZXRDb2RlIHtcbiAgICAvLyBFbnN1cmUgY29kZSBpcyBhIHN0cmluZyBhbmQgaGFzIHRoZSBtaW5pbXVtIHJlcXVpcmVkIGxlbmd0aCBmb3IgZml4ZWQgcGFydHNcbiAgICBpZiAodHlwZW9mIGNvZGUgIT09ICdzdHJpbmcnIHx8IGNvZGUubGVuZ3RoIDwgOSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFsbGV0IGNvZGUgZm9ybWF0IG9yIGxlbmd0aDogXCIke2NvZGV9XCJgKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXlPZldlZWsgPSBjb2RlLnN1YnN0cmluZygwLCAxKTtcbiAgICBjb25zdCB3ZWVrT2ZZZWFyID0gY29kZS5zdWJzdHJpbmcoMSwgMyk7XG4gICAgY29uc3QgeWVhciA9IGNvZGUuc3Vic3RyaW5nKDMsIDUpO1xuICAgIGNvbnN0IHNoaWZ0ID0gY29kZS5zdWJzdHJpbmcoNSwgNik7XG4gICAgY29uc3QgY2FsaWJlciA9IGNvZGUuc3Vic3RyaW5nKDYsIDgpO1xuICAgIGNvbnN0IGZvcm1hdCA9IGNvZGUuc3Vic3RyaW5nKDgsIDkpO1xuICAgIGNvbnN0IHBhbGxldE51bWJlciA9IGNvZGUuc3Vic3RyaW5nKDkpOyAvLyBSZXN0IG9mIHRoZSBzdHJpbmcgaXMgdGhlIHBhbGxldCBudW1iZXJcblxuICAgIC8vIE9wdGlvbmFsOiBBZGQgdmFsaWRhdGlvbiBmb3IgdGhlIGZvcm1hdCBvZiBleHRyYWN0ZWQgY29tcG9uZW50cyBpZiBuZWVkZWRcbiAgICAvLyBlLmcuLCBjaGVjayBpZiBkYXlPZldlZWsgaXMgMS03LCB3ZWVrT2ZZZWFyIDAxLTUzLCB5ZWFyIGlzIGRpZ2l0cywgZXRjLlxuICAgIC8vIEZvciBzaW1wbGljaXR5LCBzdGlja2luZyB0byBzdHJpbmcgZXh0cmFjdGlvbiBhcyBpbiBvcmlnaW5hbCBKUy5cblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGF5T2ZXZWVrLFxuICAgICAgICB3ZWVrT2ZZZWFyLFxuICAgICAgICB5ZWFyLFxuICAgICAgICBzaGlmdCxcbiAgICAgICAgY2FsaWJlcixcbiAgICAgICAgZm9ybWF0LFxuICAgICAgICBwYWxsZXROdW1iZXJcbiAgICB9O1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBvciBjcmVhdGVzIGEgcGFsbGV0IGluIHRoZSBkYXRhYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IHBhbGxldENvZGUgLSBDb2RlIGlkZW50aWZ5aW5nIHRoZSBwYWxsZXRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdWJpY2FjaW9uPVwiUEFDS0lOR1wiXSAtIFRoZSBpbml0aWFsIGxvY2F0aW9uIGlmIGNyZWF0aW5nIGEgbmV3IHBhbGxldFxuICogQHJldHVybnMge1Byb21pc2U8UGFsbGV0Pn0gVGhlIHBhbGxldCBvYmplY3QgKGV4aXN0aW5nIG9yIG5ld2x5IGNyZWF0ZWQpXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcGFsbGV0IHJldHJpZXZhbCBvciBjcmVhdGlvbiBmYWlsc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNzaWduUGFsbGV0KHBhbGxldENvZGU6IHN0cmluZywgdWJpY2FjaW9uOiBzdHJpbmcgPSBcIlBBQ0tJTkdcIik6IFByb21pc2U8UGFsbGV0PiB7XG4gICAgY29uc29sZS5sb2coYPCflI0gQ2hlY2tpbmcgZm9yIHBhbGxldCB3aXRoIGNvZGU6IFwiJHtwYWxsZXRDb2RlfVwiYCk7XG5cbiAgICAvLyBWYWxpZGF0ZSBwYWxsZXRDb2RlIGlzIGEgbm9uLWVtcHR5IHN0cmluZ1xuICAgIGlmICh0eXBlb2YgcGFsbGV0Q29kZSAhPT0gJ3N0cmluZycgfHwgcGFsbGV0Q29kZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQYWxsZXQgY29kZSBtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZywgcmVjZWl2ZWQ6ICR7dHlwZW9mIHBhbGxldENvZGV9YCk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gUGFyc2UgdGhlIHBhbGxldCBjb2RlIHRvIHZhbGlkYXRlIGZvcm1hdCBiZWZvcmUgREIgb3BlcmF0aW9uXG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBlcnJvciBpZiB0aGUgY29kZSBpcyB0b28gc2hvcnQgb3Igbm90IGEgc3RyaW5nLCBhcyBwZXIgcGFyc2VQYWxsZXRDb2RlIGxvZ2ljXG4gICAgICAgIHBhcnNlUGFsbGV0Q29kZShwYWxsZXRDb2RlKTtcblxuICAgICAgICAvLyBBdHRlbXB0IHRvIHJldHJpZXZlIGV4aXN0aW5nIHBhbGxldFxuICAgICAgICBjb25zdCBwYXJhbXM6IERvY3VtZW50Q2xpZW50LkdldEl0ZW1JbnB1dCA9IHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogUEFMTEVUU19UQUJMRSxcbiAgICAgICAgICAgIEtleTogeyBjb2RpZ286IHBhbGxldENvZGUgfSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBnZXRSZXN1bHQgPSBhd2FpdCBkeW5hbW9EQi5nZXQocGFyYW1zKS5wcm9taXNlKCk7XG4gICAgICAgIGxldCBwYWxsZXQ6IFBhbGxldCB8IHVuZGVmaW5lZCA9IGdldFJlc3VsdC5JdGVtIGFzIFBhbGxldCB8IHVuZGVmaW5lZDsgLy8gVHlwZSBhc3NlcnRpb25cblxuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgcGFsbGV0IGlmIG5vdCBmb3VuZFxuICAgICAgICBpZiAoIXBhbGxldCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOKcqCBQYWxsZXQgXCIke3BhbGxldENvZGV9XCIgbm90IGZvdW5kLiBDcmVhdGluZyBuZXcgcGFsbGV0LmApO1xuICAgICAgICAgICAgLy8gQ2FsbCB0aGUgY3JlYXRlUGFsbGV0IGZ1bmN0aW9uIGFuZCBhd2FpdCBpdHMgcmVzdWx0XG4gICAgICAgICAgICAvLyBjcmVhdGVQYWxsZXQgcmV0dXJucyBhbiBBcGlSZXNwb25zZSwgd2UgbmVlZCB0byBleHRyYWN0IHRoZSBwYWxsZXQgZGF0YSBmcm9tIGl0XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNyZWF0ZVBhbGxldChwYWxsZXRDb2RlKTtcbiAgICAgICAgICAgIC8vIEV4dHJhY3QgdGhlIHBhbGxldCBkYXRhIGZyb20gdGhlIEFwaVJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZUJvZHkgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmJvZHkpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlQm9keS5zdGF0dXMgPT09ICdzdWNjZXNzJyAmJiByZXNwb25zZUJvZHkuZGF0YSkge1xuICAgICAgICAgICAgICAgIHBhbGxldCA9IHJlc3BvbnNlQm9keS5kYXRhIGFzIFBhbGxldDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gY3JlYXRlIHBhbGxldDogJHtyZXNwb25zZUJvZHkubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUgTmV3IHBhbGxldCBjcmVhdGVkOiAke0pTT04uc3RyaW5naWZ5KHBhbGxldCl9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg4pyFIEZvdW5kIGV4aXN0aW5nIHBhbGxldDogJHtKU09OLnN0cmluZ2lmeShwYWxsZXQpfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWZ0ZXIgZmluZGluZyBvciBjcmVhdGluZywgZW5zdXJlIGEgcGFsbGV0IG9iamVjdCBpcyBhdmFpbGFibGVcbiAgICAgICAgaWYgKCFwYWxsZXQpIHtcbiAgICAgICAgICAgICAvLyBUaGlzIGNhc2Ugc2hvdWxkIGlkZWFsbHkgbm90IGhhcHBlbiBpZiBjcmVhdGVQYWxsZXQgaXMgaW1wbGVtZW50ZWQgY29ycmVjdGx5LFxuICAgICAgICAgICAgIC8vIGJ1dCBzZXJ2ZXMgYXMgYSBzYWZlZ3VhcmQuXG4gICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcmV0cmlldmUgb3IgY3JlYXRlIHBhbGxldCB3aXRoIGNvZGUgXCIke3BhbGxldENvZGV9XCIuYCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHJldHVybiBwYWxsZXQ7IC8vIFJldHVybiB0aGUgZm91bmQgb3IgbmV3bHkgY3JlYXRlZCBwYWxsZXRcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7IC8vIFVzZSAnYW55JyBmb3IgYnJvYWRlciBjb21wYXRpYmlsaXR5IHdpdGggZXJyb3IgdHlwZXNcbiAgICAgICAgY29uc29sZS5lcnJvcihcIuKdjCBFcnJvciBkdXJpbmcgcGFsbGV0IGFzc2lnbm1lbnQ6XCIsIGVycm9yKTtcbiAgICAgICAgLy8gUmUtdGhyb3cgYSBuZXcgZXJyb3Igd2l0aCBhIG1vcmUgZ2VuZXJhbCBtZXNzYWdlIGZvciB0aGUgQVBJIGxheWVyL2NhbGxlclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgb3IgY3JlYXRlIHBhbGxldDogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIH1cbn1cblxuLy8gRXhwb3J0IHRoZSBmdW5jdGlvbiBmb3IgZXh0ZXJuYWwgdXNlXG5leHBvcnQgZGVmYXVsdCBhc3NpZ25QYWxsZXQ7Il19