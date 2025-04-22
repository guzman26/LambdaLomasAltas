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
exports.handleCreatePallet = handleCreatePallet;
const AWS = __importStar(require("aws-sdk"));
// Assuming createApiResponse is also converted to TypeScript and exports the function and type
const response_1 = __importDefault(require("../../utils/response")); // Adjust path if necessary
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PALLETS_TABLE = "Pallets";
/**
 * Parses a pallet code string into its components
 * @param {string} code - Pallet code to parse with format DSSYYHFNNN...
 * @returns {ParsedPalletCode} Parsed pallet code components
 * @throws {Error} If code format is invalid
 */
function parsePalletCode(code) {
    // Ensure code is a string and has the minimum required length for fixed parts
    if (typeof code !== 'string' || code.length < 9) {
        throw new Error(`Invalid pallet code format or length: "${code}"`);
    }
    // Note: This parsing assumes a full pallet code like DSSYYHFNNN.
    // If used with just the 9-digit base code, `palletNumber` will be empty.
    const dayOfWeek = code.substring(0, 1);
    const weekOfYear = code.substring(1, 3);
    const year = code.substring(3, 5);
    const shift = code.substring(5, 6);
    const caliber = code.substring(6, 8);
    const format = code.substring(8, 9);
    const palletNumber = code.substring(9); // Rest of the string is the pallet number
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
 * Handles the creation of a new pallet, appending a unique 3-digit number to the base code.
 * @param {string} baseCode - The 9-digit base code (DSSYYHF)
 * @returns {Promise<ApiResponse>} API response with the created pallet or an error.
 */
async function handleCreatePallet(baseCode) {
    // Validate the input baseCode
    if (typeof baseCode !== 'string' || baseCode.length !== 9) {
        return (0, response_1.default)(400, "Invalid or missing 'baseCode'. Must be a 9-digit string.");
    }
    try {
        // 1. Query existing pallets with the baseCode prefix
        const scanParams = {
            TableName: PALLETS_TABLE,
            FilterExpression: "begins_with(codigo, :base)",
            ExpressionAttributeValues: {
                ":base": baseCode,
            },
            ProjectionExpression: "codigo" // Only retrieve the 'codigo' attribute
        };
        const existingCodes = [];
        let items;
        let lastEvaluatedKey;
        // Use pagination for scan
        do {
            items = await dynamoDB.scan({
                ...scanParams,
                ExclusiveStartKey: lastEvaluatedKey
            }).promise();
            if (items.Items) {
                // Map items to their 'codigo' and add to existingCodes
                existingCodes.push(...items.Items.map(item => item.codigo));
            }
            lastEvaluatedKey = items.LastEvaluatedKey;
        } while (lastEvaluatedKey);
        // 2. Extract suffixes and find the max
        const suffixes = existingCodes
            .map(code => code.slice(9)) // Get the part after the 9-digit base code
            .filter(suffix => /^\d{3}$/.test(suffix)) // Keep only 3-digit numerical suffixes
            .map(Number); // Convert valid suffixes to numbers
        // Calculate the next suffix: 1 if no existing suffixes, otherwise max + 1
        const nextSuffix = suffixes.length === 0 ? 1 : Math.max(...suffixes) + 1;
        // Format the next suffix as a 3-digit string
        const nextSuffixString = String(nextSuffix).padStart(3, '0');
        // Construct the final pallet code
        const finalPalletCode = `${baseCode}${nextSuffixString}`;
        // Reconstruct fechaCalibreFormato from the baseCode (first 9 digits)
        // Note: Using parsePalletCode here with the *full* code would include the new suffix,
        // which might not be what 'fechaCalibreFormato' is intended to store (usually just the production date/caliber/format).
        // Sticking to deriving it from the *baseCode* as implied by original variable naming,
        // but the original code derived it from `finalPalletCode` which is potentially a bug.
        // Let's stick to the original JS behavior of deriving from `finalPalletCode` for a direct conversion,
        // but note this might be logically incorrect if fechaCalibreFormato should only contain the first 9 chars.
        // Based on the original code:
        // const { dayOfWeek, weekOfYear, year, shift, caliber, format } = parsePalletCode(finalPalletCode);
        // const fechaCalibreFormato = `${dayOfWeek}${weekOfYear}${year}${shift}${caliber}${format}`;
        // This approach re-parses the *full* code, which includes the generated number.
        // It seems more likely 'fechaCalibreFormato' is just the original 9-digit base code.
        // Let's assume 'fechaCalibreFormato' is just the baseCode for logical correctness,
        // although the original JS code's derivation from `finalPalletCode` is ambiguous.
        const fechaCalibreFormato = baseCode; // Assuming this should just be the input base code
        // If the original code *intended* to use the parsed components from the *full* code,
        // the derivation would be like this (but less likely for a field named fechaCalibreFormato):
        // const parsedFullCode = parsePalletCode(finalPalletCode);
        // const fechaCalibreFormato = `${parsedFullCode.dayOfWeek}${parsedFullCode.weekOfYear}${parsedFullCode.year}${parsedFullCode.shift}${parsedFullCode.caliber}${parsedFullCode.format}`;
        // Let's assume `fechaCalibreFormato` is simply the `baseCode` for now.
        // 3. Create the pallet item structure
        const newPallet = {
            codigo: finalPalletCode, // Full code with sequence number
            fechaCalibreFormato: fechaCalibreFormato, // The 9-digit base code
            estado: "open",
            cajas: [], // Start with an empty array of boxes
            cantidadCajas: 0,
            fechaCreacion: new Date().toISOString(),
            ubicacion: "PACKING" // Default location
            // Add other required fields as per your Pallet schema
        };
        // 4. Put the new pallet item into DynamoDB
        const putParams = {
            TableName: PALLETS_TABLE,
            Item: newPallet // Type assertion because PutItem expects a generic ItemCollection
        };
        await dynamoDB.put(putParams).promise();
        console.log("✅ Pallet created successfully:", newPallet);
        // 5. Return success API response
        return (0, response_1.default)(201, "Pallet created successfully", newPallet);
    }
    catch (err) { // Use 'any' for broader compatibility with error types
        console.error("❌ Error creating pallet:", err);
        // Return error API response
        return (0, response_1.default)(500, "Failed to create pallet", { error: err.message });
    }
}
// Export the function for external use
exports.default = handleCreatePallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvcGFsbGV0cy9jcmVhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpRkEsZ0RBd0dDO0FBekxELDZDQUErQjtBQUcvQiwrRkFBK0Y7QUFDL0Ysb0VBQXFELENBQUMsMkJBQTJCO0FBSWpGLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUVuRCxNQUFNLGFBQWEsR0FBVyxTQUFTLENBQUM7QUFnQ3hDOzs7OztHQUtHO0FBQ0gsU0FBUyxlQUFlLENBQUMsSUFBWTtJQUNuQyw4RUFBOEU7SUFDOUUsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNoRCxNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCxpRUFBaUU7SUFDakUseUVBQXlFO0lBQ3pFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENB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LGtCQUFlLGtCQUFrQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XG5pbXBvcnQgeyBEb2N1bWVudENsaWVudCB9IGZyb20gJ2F3cy1zZGsvY2xpZW50cy9keW5hbW9kYic7XG5cbi8vIEFzc3VtaW5nIGNyZWF0ZUFwaVJlc3BvbnNlIGlzIGFsc28gY29udmVydGVkIHRvIFR5cGVTY3JpcHQgYW5kIGV4cG9ydHMgdGhlIGZ1bmN0aW9uIGFuZCB0eXBlXG5pbXBvcnQgY3JlYXRlQXBpUmVzcG9uc2UgZnJvbSBcIi4uLy4uL3V0aWxzL3Jlc3BvbnNlXCI7IC8vIEFkanVzdCBwYXRoIGlmIG5lY2Vzc2FyeVxuaW1wb3J0IHsgQXBpUmVzcG9uc2UgfSBmcm9tIFwiLi4vLi4vdHlwZXNcIjsgLy8gSW1wb3J0IGZyb20gdHlwZXMgaW5zdGVhZCBvZiByZXNwb25zZVxuXG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG5jb25zdCBQQUxMRVRTX1RBQkxFOiBzdHJpbmcgPSBcIlBhbGxldHNcIjtcblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBwYXJzZWQgcGFsbGV0IGNvZGUgY29tcG9uZW50cy5cbiAqIE5vdGU6IFRoaXMgaW50ZXJmYWNlIGFuZCBmdW5jdGlvbiBzZWVtIGludGVuZGVkIGZvciAqZnVsbCogcGFsbGV0IGNvZGVzICg+PSAxMiBjaGFycyksXG4gKiBidXQgaGFuZGxlQ3JlYXRlUGFsbGV0IHVzZXMgdGhlbSB3aXRoIGEgOS1kaWdpdCBiYXNlIGNvZGUsIHdoaWNoIG1pZ2h0IGJlIGEgbWlzbWF0Y2guXG4gKiBLZWVwaW5nIGl0IGFzIGlzIGZvciB0aGUgY29udmVyc2lvbiBidXQgbm90aW5nIHRoZSBwb3RlbnRpYWwgY29uZnVzaW9uLlxuICovXG5pbnRlcmZhY2UgUGFyc2VkUGFsbGV0Q29kZSB7XG4gICAgZGF5T2ZXZWVrOiBzdHJpbmc7XG4gICAgd2Vla09mWWVhcjogc3RyaW5nO1xuICAgIHllYXI6IHN0cmluZztcbiAgICBzaGlmdDogc3RyaW5nO1xuICAgIGNhbGliZXI6IHN0cmluZztcbiAgICBmb3JtYXQ6IHN0cmluZztcbiAgICBwYWxsZXROdW1iZXI6IHN0cmluZzsgLy8gQ2FuIGJlIHZhcmlhYmxlIGxlbmd0aFxufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIFBhbGxldCBkYXRhIHN0cnVjdHVyZSBhcyBjcmVhdGVkL2V4cGVjdGVkIGJ5IHRoaXMgZnVuY3Rpb24uXG4gKi9cbmludGVyZmFjZSBQYWxsZXQge1xuICAgIGNvZGlnbzogc3RyaW5nOyAvLyBGdWxsIHBhbGxldCBjb2RlIChlLmcuLCBEU1NZWUhGTk5OKSAtIFBhcnRpdGlvbiBLZXlcbiAgICBmZWNoYUNhbGlicmVGb3JtYXRvOiBzdHJpbmc7IC8vIERTU1lZSEYgc3RyaW5nIHBhcnQgZm9yIHF1ZXJ5aW5nL2dyb3VwaW5nP1xuICAgIGVzdGFkbzogXCJvcGVuXCIgfCBcImNsb3NlZFwiIHwgc3RyaW5nOyAvLyBBZGQgb3RoZXIgc3RhdGVzIGlmIGFwcGxpY2FibGVcbiAgICBjYWphczogc3RyaW5nW107IC8vIEFycmF5IG9mIGJveCBjb2Rlc1xuICAgIGNhbnRpZGFkQ2FqYXM6IG51bWJlcjtcbiAgICBmZWNoYUNyZWFjaW9uOiBzdHJpbmc7IC8vIElTTyA4NjAxIHN0cmluZ1xuICAgIHViaWNhY2lvbjogc3RyaW5nOyAvLyBlLmcuLCBcIlBBQ0tJTkdcIlxuICAgIC8vIEFkZCBvdGhlciBwYWxsZXQgcHJvcGVydGllcyBpZiBrbm93blxufVxuXG4vKipcbiAqIFBhcnNlcyBhIHBhbGxldCBjb2RlIHN0cmluZyBpbnRvIGl0cyBjb21wb25lbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gY29kZSAtIFBhbGxldCBjb2RlIHRvIHBhcnNlIHdpdGggZm9ybWF0IERTU1lZSEZOTk4uLi5cbiAqIEByZXR1cm5zIHtQYXJzZWRQYWxsZXRDb2RlfSBQYXJzZWQgcGFsbGV0IGNvZGUgY29tcG9uZW50c1xuICogQHRocm93cyB7RXJyb3J9IElmIGNvZGUgZm9ybWF0IGlzIGludmFsaWRcbiAqL1xuZnVuY3Rpb24gcGFyc2VQYWxsZXRDb2RlKGNvZGU6IHN0cmluZyk6IFBhcnNlZFBhbGxldENvZGUge1xuICAvLyBFbnN1cmUgY29kZSBpcyBhIHN0cmluZyBhbmQgaGFzIHRoZSBtaW5pbXVtIHJlcXVpcmVkIGxlbmd0aCBmb3IgZml4ZWQgcGFydHNcbiAgaWYgKHR5cGVvZiBjb2RlICE9PSAnc3RyaW5nJyB8fCBjb2RlLmxlbmd0aCA8IDkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFsbGV0IGNvZGUgZm9ybWF0IG9yIGxlbmd0aDogXCIke2NvZGV9XCJgKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFRoaXMgcGFyc2luZyBhc3N1bWVzIGEgZnVsbCBwYWxsZXQgY29kZSBsaWtlIERTU1lZSEZOTk4uXG4gIC8vIElmIHVzZWQgd2l0aCBqdXN0IHRoZSA5LWRpZ2l0IGJhc2UgY29kZSwgYHBhbGxldE51bWJlcmAgd2lsbCBiZSBlbXB0eS5cbiAgY29uc3QgZGF5T2ZXZWVrID0gY29kZS5zdWJzdHJpbmcoMCwgMSk7XG4gIGNvbnN0IHdlZWtPZlllYXIgPSBjb2RlLnN1YnN0cmluZygxLCAzKTtcbiAgY29uc3QgeWVhciA9IGNvZGUuc3Vic3RyaW5nKDMsIDUpO1xuICBjb25zdCBzaGlmdCA9IGNvZGUuc3Vic3RyaW5nKDUsIDYpO1xuICBjb25zdCBjYWxpYmVyID0gY29kZS5zdWJzdHJpbmcoNiwgOCk7XG4gIGNvbnN0IGZvcm1hdCA9IGNvZGUuc3Vic3RyaW5nKDgsIDkpO1xuICBjb25zdCBwYWxsZXROdW1iZXIgPSBjb2RlLnN1YnN0cmluZyg5KTsgLy8gUmVzdCBvZiB0aGUgc3RyaW5nIGlzIHRoZSBwYWxsZXQgbnVtYmVyXG5cbiAgcmV0dXJuIHtcbiAgICBkYXlPZldlZWssXG4gICAgd2Vla09mWWVhcixcbiAgICB5ZWFyLFxuICAgIHNoaWZ0LFxuICAgIGNhbGliZXIsXG4gICAgZm9ybWF0LFxuICAgIHBhbGxldE51bWJlclxuICB9O1xufVxuXG5cbi8qKlxuICogSGFuZGxlcyB0aGUgY3JlYXRpb24gb2YgYSBuZXcgcGFsbGV0LCBhcHBlbmRpbmcgYSB1bmlxdWUgMy1kaWdpdCBudW1iZXIgdG8gdGhlIGJhc2UgY29kZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlQ29kZSAtIFRoZSA5LWRpZ2l0IGJhc2UgY29kZSAoRFNTWVlIRilcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFwaVJlc3BvbnNlPn0gQVBJIHJlc3BvbnNlIHdpdGggdGhlIGNyZWF0ZWQgcGFsbGV0IG9yIGFuIGVycm9yLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ3JlYXRlUGFsbGV0KGJhc2VDb2RlOiBzdHJpbmcpOiBQcm9taXNlPEFwaVJlc3BvbnNlPiB7XG5cbiAgLy8gVmFsaWRhdGUgdGhlIGlucHV0IGJhc2VDb2RlXG4gIGlmICh0eXBlb2YgYmFzZUNvZGUgIT09ICdzdHJpbmcnIHx8IGJhc2VDb2RlLmxlbmd0aCAhPT0gOSkge1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg0MDAsIFwiSW52YWxpZCBvciBtaXNzaW5nICdiYXNlQ29kZScuIE11c3QgYmUgYSA5LWRpZ2l0IHN0cmluZy5cIik7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIDEuIFF1ZXJ5IGV4aXN0aW5nIHBhbGxldHMgd2l0aCB0aGUgYmFzZUNvZGUgcHJlZml4XG4gICAgY29uc3Qgc2NhblBhcmFtczogRG9jdW1lbnRDbGllbnQuU2NhbklucHV0ID0ge1xuICAgICAgVGFibGVOYW1lOiBQQUxMRVRTX1RBQkxFLFxuICAgICAgRmlsdGVyRXhwcmVzc2lvbjogXCJiZWdpbnNfd2l0aChjb2RpZ28sIDpiYXNlKVwiLFxuICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICBcIjpiYXNlXCI6IGJhc2VDb2RlLFxuICAgICAgfSxcbiAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiBcImNvZGlnb1wiIC8vIE9ubHkgcmV0cmlldmUgdGhlICdjb2RpZ28nIGF0dHJpYnV0ZVxuICAgIH07XG5cbiAgICBjb25zdCBleGlzdGluZ0NvZGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBpdGVtczogRG9jdW1lbnRDbGllbnQuU2Nhbk91dHB1dDtcbiAgICBsZXQgbGFzdEV2YWx1YXRlZEtleTogRG9jdW1lbnRDbGllbnQuS2V5IHwgdW5kZWZpbmVkO1xuXG4gICAgLy8gVXNlIHBhZ2luYXRpb24gZm9yIHNjYW5cbiAgICBkbyB7XG4gICAgICBpdGVtcyA9IGF3YWl0IGR5bmFtb0RCLnNjYW4oe1xuICAgICAgICAgIC4uLnNjYW5QYXJhbXMsXG4gICAgICAgICAgRXhjbHVzaXZlU3RhcnRLZXk6IGxhc3RFdmFsdWF0ZWRLZXlcbiAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgaWYgKGl0ZW1zLkl0ZW1zKSB7XG4gICAgICAgICAvLyBNYXAgaXRlbXMgdG8gdGhlaXIgJ2NvZGlnbycgYW5kIGFkZCB0byBleGlzdGluZ0NvZGVzXG4gICAgICAgICBleGlzdGluZ0NvZGVzLnB1c2goLi4uaXRlbXMuSXRlbXMubWFwKGl0ZW0gPT4gKGl0ZW0gYXMgeyBjb2RpZ286IHN0cmluZyB9KS5jb2RpZ28pKTtcbiAgICAgIH1cblxuICAgICAgbGFzdEV2YWx1YXRlZEtleSA9IGl0ZW1zLkxhc3RFdmFsdWF0ZWRLZXk7XG4gICAgfSB3aGlsZSAobGFzdEV2YWx1YXRlZEtleSk7XG5cblxuICAgIC8vIDIuIEV4dHJhY3Qgc3VmZml4ZXMgYW5kIGZpbmQgdGhlIG1heFxuICAgIGNvbnN0IHN1ZmZpeGVzOiBudW1iZXJbXSA9IGV4aXN0aW5nQ29kZXNcbiAgICAgIC5tYXAoY29kZSA9PiBjb2RlLnNsaWNlKDkpKSAvLyBHZXQgdGhlIHBhcnQgYWZ0ZXIgdGhlIDktZGlnaXQgYmFzZSBjb2RlXG4gICAgICAuZmlsdGVyKHN1ZmZpeCA9PiAvXlxcZHszfSQvLnRlc3Qoc3VmZml4KSkgLy8gS2VlcCBvbmx5IDMtZGlnaXQgbnVtZXJpY2FsIHN1ZmZpeGVzXG4gICAgICAubWFwKE51bWJlcik7IC8vIENvbnZlcnQgdmFsaWQgc3VmZml4ZXMgdG8gbnVtYmVyc1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBuZXh0IHN1ZmZpeDogMSBpZiBubyBleGlzdGluZyBzdWZmaXhlcywgb3RoZXJ3aXNlIG1heCArIDFcbiAgICBjb25zdCBuZXh0U3VmZml4ID0gc3VmZml4ZXMubGVuZ3RoID09PSAwID8gMSA6IE1hdGgubWF4KC4uLnN1ZmZpeGVzKSArIDE7XG5cbiAgICAvLyBGb3JtYXQgdGhlIG5leHQgc3VmZml4IGFzIGEgMy1kaWdpdCBzdHJpbmdcbiAgICBjb25zdCBuZXh0U3VmZml4U3RyaW5nID0gU3RyaW5nKG5leHRTdWZmaXgpLnBhZFN0YXJ0KDMsICcwJyk7XG5cbiAgICAvLyBDb25zdHJ1Y3QgdGhlIGZpbmFsIHBhbGxldCBjb2RlXG4gICAgY29uc3QgZmluYWxQYWxsZXRDb2RlID0gYCR7YmFzZUNvZGV9JHtuZXh0U3VmZml4U3RyaW5nfWA7XG5cbiAgICAvLyBSZWNvbnN0cnVjdCBmZWNoYUNhbGlicmVGb3JtYXRvIGZyb20gdGhlIGJhc2VDb2RlIChmaXJzdCA5IGRpZ2l0cylcbiAgICAvLyBOb3RlOiBVc2luZyBwYXJzZVBhbGxldENvZGUgaGVyZSB3aXRoIHRoZSAqZnVsbCogY29kZSB3b3VsZCBpbmNsdWRlIHRoZSBuZXcgc3VmZml4LFxuICAgIC8vIHdoaWNoIG1pZ2h0IG5vdCBiZSB3aGF0ICdmZWNoYUNhbGlicmVGb3JtYXRvJyBpcyBpbnRlbmRlZCB0byBzdG9yZSAodXN1YWxseSBqdXN0IHRoZSBwcm9kdWN0aW9uIGRhdGUvY2FsaWJlci9mb3JtYXQpLlxuICAgIC8vIFN0aWNraW5nIHRvIGRlcml2aW5nIGl0IGZyb20gdGhlICpiYXNlQ29kZSogYXMgaW1wbGllZCBieSBvcmlnaW5hbCB2YXJpYWJsZSBuYW1pbmcsXG4gICAgLy8gYnV0IHRoZSBvcmlnaW5hbCBjb2RlIGRlcml2ZWQgaXQgZnJvbSBgZmluYWxQYWxsZXRDb2RlYCB3aGljaCBpcyBwb3RlbnRpYWxseSBhIGJ1Zy5cbiAgICAvLyBMZXQncyBzdGljayB0byB0aGUgb3JpZ2luYWwgSlMgYmVoYXZpb3Igb2YgZGVyaXZpbmcgZnJvbSBgZmluYWxQYWxsZXRDb2RlYCBmb3IgYSBkaXJlY3QgY29udmVyc2lvbixcbiAgICAvLyBidXQgbm90ZSB0aGlzIG1pZ2h0IGJlIGxvZ2ljYWxseSBpbmNvcnJlY3QgaWYgZmVjaGFDYWxpYnJlRm9ybWF0byBzaG91bGQgb25seSBjb250YWluIHRoZSBmaXJzdCA5IGNoYXJzLlxuICAgIC8vIEJhc2VkIG9uIHRoZSBvcmlnaW5hbCBjb2RlOlxuICAgIC8vIGNvbnN0IHsgZGF5T2ZXZWVrLCB3ZWVrT2ZZZWFyLCB5ZWFyLCBzaGlmdCwgY2FsaWJlciwgZm9ybWF0IH0gPSBwYXJzZVBhbGxldENvZGUoZmluYWxQYWxsZXRDb2RlKTtcbiAgICAvLyBjb25zdCBmZWNoYUNhbGlicmVGb3JtYXRvID0gYCR7ZGF5T2ZXZWVrfSR7d2Vla09mWWVhcn0ke3llYXJ9JHtzaGlmdH0ke2NhbGliZXJ9JHtmb3JtYXR9YDtcbiAgICAvLyBUaGlzIGFwcHJvYWNoIHJlLXBhcnNlcyB0aGUgKmZ1bGwqIGNvZGUsIHdoaWNoIGluY2x1ZGVzIHRoZSBnZW5lcmF0ZWQgbnVtYmVyLlxuICAgIC8vIEl0IHNlZW1zIG1vcmUgbGlrZWx5ICdmZWNoYUNhbGlicmVGb3JtYXRvJyBpcyBqdXN0IHRoZSBvcmlnaW5hbCA5LWRpZ2l0IGJhc2UgY29kZS5cbiAgICAvLyBMZXQncyBhc3N1bWUgJ2ZlY2hhQ2FsaWJyZUZvcm1hdG8nIGlzIGp1c3QgdGhlIGJhc2VDb2RlIGZvciBsb2dpY2FsIGNvcnJlY3RuZXNzLFxuICAgIC8vIGFsdGhvdWdoIHRoZSBvcmlnaW5hbCBKUyBjb2RlJ3MgZGVyaXZhdGlvbiBmcm9tIGBmaW5hbFBhbGxldENvZGVgIGlzIGFtYmlndW91cy5cbiAgICBjb25zdCBmZWNoYUNhbGlicmVGb3JtYXRvOiBzdHJpbmcgPSBiYXNlQ29kZTsgLy8gQXNzdW1pbmcgdGhpcyBzaG91bGQganVzdCBiZSB0aGUgaW5wdXQgYmFzZSBjb2RlXG5cbiAgICAvLyBJZiB0aGUgb3JpZ2luYWwgY29kZSAqaW50ZW5kZWQqIHRvIHVzZSB0aGUgcGFyc2VkIGNvbXBvbmVudHMgZnJvbSB0aGUgKmZ1bGwqIGNvZGUsXG4gICAgLy8gdGhlIGRlcml2YXRpb24gd291bGQgYmUgbGlrZSB0aGlzIChidXQgbGVzcyBsaWtlbHkgZm9yIGEgZmllbGQgbmFtZWQgZmVjaGFDYWxpYnJlRm9ybWF0byk6XG4gICAgLy8gY29uc3QgcGFyc2VkRnVsbENvZGUgPSBwYXJzZVBhbGxldENvZGUoZmluYWxQYWxsZXRDb2RlKTtcbiAgICAvLyBjb25zdCBmZWNoYUNhbGlicmVGb3JtYXRvID0gYCR7cGFyc2VkRnVsbENvZGUuZGF5T2ZXZWVrfSR7cGFyc2VkRnVsbENvZGUud2Vla09mWWVhcn0ke3BhcnNlZEZ1bGxDb2RlLnllYXJ9JHtwYXJzZWRGdWxsQ29kZS5zaGlmdH0ke3BhcnNlZEZ1bGxDb2RlLmNhbGliZXJ9JHtwYXJzZWRGdWxsQ29kZS5mb3JtYXR9YDtcbiAgICAvLyBMZXQncyBhc3N1bWUgYGZlY2hhQ2FsaWJyZUZvcm1hdG9gIGlzIHNpbXBseSB0aGUgYGJhc2VDb2RlYCBmb3Igbm93LlxuXG4gICAgLy8gMy4gQ3JlYXRlIHRoZSBwYWxsZXQgaXRlbSBzdHJ1Y3R1cmVcbiAgICBjb25zdCBuZXdQYWxsZXQ6IFBhbGxldCA9IHtcbiAgICAgIGNvZGlnbzogZmluYWxQYWxsZXRDb2RlLCAvLyBGdWxsIGNvZGUgd2l0aCBzZXF1ZW5jZSBudW1iZXJcbiAgICAgIGZlY2hhQ2FsaWJyZUZvcm1hdG86IGZlY2hhQ2FsaWJyZUZvcm1hdG8sIC8vIFRoZSA5LWRpZ2l0IGJhc2UgY29kZVxuICAgICAgZXN0YWRvOiBcIm9wZW5cIixcbiAgICAgIGNhamFzOiBbXSwgLy8gU3RhcnQgd2l0aCBhbiBlbXB0eSBhcnJheSBvZiBib3hlc1xuICAgICAgY2FudGlkYWRDYWphczogMCxcbiAgICAgIGZlY2hhQ3JlYWNpb246IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHViaWNhY2lvbjogXCJQQUNLSU5HXCIgLy8gRGVmYXVsdCBsb2NhdGlvblxuICAgICAgLy8gQWRkIG90aGVyIHJlcXVpcmVkIGZpZWxkcyBhcyBwZXIgeW91ciBQYWxsZXQgc2NoZW1hXG4gICAgfTtcblxuICAgIC8vIDQuIFB1dCB0aGUgbmV3IHBhbGxldCBpdGVtIGludG8gRHluYW1vREJcbiAgICBjb25zdCBwdXRQYXJhbXM6IERvY3VtZW50Q2xpZW50LlB1dEl0ZW1JbnB1dCA9IHtcbiAgICAgIFRhYmxlTmFtZTogUEFMTEVUU19UQUJMRSxcbiAgICAgIEl0ZW06IG5ld1BhbGxldCBhcyBhbnkgLy8gVHlwZSBhc3NlcnRpb24gYmVjYXVzZSBQdXRJdGVtIGV4cGVjdHMgYSBnZW5lcmljIEl0ZW1Db2xsZWN0aW9uXG4gICAgfTtcblxuICAgIGF3YWl0IGR5bmFtb0RCLnB1dChwdXRQYXJhbXMpLnByb21pc2UoKTtcbiAgICBjb25zb2xlLmxvZyhcIuKchSBQYWxsZXQgY3JlYXRlZCBzdWNjZXNzZnVsbHk6XCIsIG5ld1BhbGxldCk7XG5cbiAgICAvLyA1LiBSZXR1cm4gc3VjY2VzcyBBUEkgcmVzcG9uc2VcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAxLCBcIlBhbGxldCBjcmVhdGVkIHN1Y2Nlc3NmdWxseVwiLCBuZXdQYWxsZXQpO1xuXG4gIH0gY2F0Y2ggKGVycjogYW55KSB7IC8vIFVzZSAnYW55JyBmb3IgYnJvYWRlciBjb21wYXRpYmlsaXR5IHdpdGggZXJyb3IgdHlwZXNcbiAgICBjb25zb2xlLmVycm9yKFwi4p2MIEVycm9yIGNyZWF0aW5nIHBhbGxldDpcIiwgZXJyKTtcbiAgICAvLyBSZXR1cm4gZXJyb3IgQVBJIHJlc3BvbnNlXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgXCJGYWlsZWQgdG8gY3JlYXRlIHBhbGxldFwiLCB7IGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgfVxufVxuXG4vLyBFeHBvcnQgdGhlIGZ1bmN0aW9uIGZvciBleHRlcm5hbCB1c2VcbmV4cG9ydCBkZWZhdWx0IGhhbmRsZUNyZWF0ZVBhbGxldDsiXX0=