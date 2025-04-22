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
const AWS = __importStar(require("aws-sdk"));
// Assuming createApiResponse exists and potentially exports its return type
const response_1 = __importDefault(require("../utils/response"));
// --- Configuration ---
const PALLETS_TABLE_NAME = process.env.PALLETS_TABLE || "Pallets";
/*
 * Placeholder type definition for the imported utility's response.
 * Adjust this interface based on the actual structure returned by createApiResponse.
 * Example assumes a structure suitable for API Gateway Lambda Proxy integration.
 */
/* // --> If ApiResponse is NOT exported from ../utils/response, define it here:
interface ApiResponse {
  statusCode: number;
  body: string; // Usually a JSON stringified object
  headers?: { [key: string]: string };
}
*/
/*
 * Placeholder type definition for the imported utility function.
 * Adjust if the actual signature is different or if types are exported from the utility file.
 */
/* // --> If createApiResponse type is NOT exported, define its signature:
type CreateApiResponseFn = (
    statusCode: number,
    message: string,
    data?: any // Or specify a more concrete type like Pallet[] | null
) => ApiResponse;
*/
// Assume 'createApiResponse' is properly typed in its own file and exported.
// If not, you might need casting or the definitions above.
// --- AWS SDK Setup ---
const dynamoDB = new AWS.DynamoDB.DocumentClient();
/**
 * Fetches all open pallets from the "Pallets" table using a Scan operation.
 * Note: Scans can be inefficient and costly on large tables. Consider using a
 * Global Secondary Index (GSI) on the 'estado' field if performance becomes an issue.
 * @returns {Promise<ApiResponse>} An API-style response object.
 */
const getOpenPallets = async () => {
    var _a;
    console.log(`🔍 Attempting to fetch open pallets from ${PALLETS_TABLE_NAME}`);
    try {
        // 1) Define parameters for scanning only items where estado = 'open'
        const params = {
            TableName: PALLETS_TABLE_NAME,
            // Filter expression to get only open pallets
            FilterExpression: "#statusAttribute = :openStatusValue",
            // Map '#statusAttribute' placeholder to the actual attribute name 'estado'
            ExpressionAttributeNames: {
                "#statusAttribute": "estado",
            },
            // Map ':openStatusValue' placeholder to the actual value 'open'
            ExpressionAttributeValues: {
                ":openStatusValue": "open",
            },
            // Optionally add ProjectionExpression to retrieve only necessary attributes
            // ProjectionExpression: "codigo, estado, /* other needed attributes */"
        };
        // 2) Perform the scan operation on DynamoDB
        const result = await dynamoDB.scan(params).promise();
        // Safely access Items, defaulting to an empty array if undefined/null
        const openPallets = (_a = result.Items) !== null && _a !== void 0 ? _a : [];
        const count = openPallets.length;
        console.log(`✅ Found ${count} open pallet(s).`);
        // 3) Return success response using the utility function
        return (0, response_1.default)(200, `Successfully found ${count} open pallet(s).`, openPallets // Pass the array of found pallets as data
        );
    }
    catch (error) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        else if (typeof error === 'string') {
            errorMessage = error;
        }
        // Log the detailed error
        console.error(`❌ Error fetching open pallets: ${errorMessage}`, error);
        // 4) Return error response using the utility function
        // Pass null or undefined for data in case of error, depending on createApiResponse definition
        return (0, response_1.default)(500, `Error fetching open pallets: ${errorMessage}`, null);
    }
};
// Use default export as implied by the original module.exports
exports.default = getOpenPallets;
// Alternatively, use named export if preferred:
// export { getOpenPallets };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QWN0aXZlUGFsbGV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2hhbmRsZXJzL2dldEFjdGl2ZVBhbGxldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0I7QUFFL0IsNEVBQTRFO0FBQzVFLGlFQUFrRDtBQUdsRCx3QkFBd0I7QUFDeEIsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTLENBQUM7QUFjbEU7Ozs7R0FJRztBQUNIOzs7Ozs7RUFNRTtBQUVGOzs7R0FHRztBQUNIOzs7Ozs7RUFNRTtBQUVGLDZFQUE2RTtBQUM3RSwyREFBMkQ7QUFFM0Qsd0JBQXdCO0FBQ3hCLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUVuRDs7Ozs7R0FLRztBQUNILE1BQU0sY0FBYyxHQUFHLEtBQUssSUFBMEIsRUFBRTs7SUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0lBRTlFLElBQUksQ0FBQztRQUNILHFFQUFxRTtRQUNyRSxNQUFNLE1BQU0sR0FBNkI7WUFDdkMsU0FBUyxFQUFFLGtCQUFrQjtZQUM3Qiw2Q0FBNkM7WUFDN0MsZ0JBQWdCLEVBQUUscUNBQXFDO1lBQ3ZELDJFQUEyRTtZQUMzRSx3QkFBd0IsRUFBRTtnQkFDeEIsa0JBQWtCLEVBQUUsUUFBUTthQUM3QjtZQUNELGdFQUFnRTtZQUNoRSx5QkFBeUIsRUFBRTtnQkFDekIsa0JBQWtCLEVBQUUsTUFBTTthQUMzQjtZQUNELDRFQUE0RTtZQUM1RSx3RUFBd0U7U0FDekUsQ0FBQztRQUVGLDRDQUE0QztRQUM1QyxNQUFNLE1BQU0sR0FBOEIsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWhGLHNFQUFzRTtRQUN0RSxNQUFNLFdBQVcsR0FBRyxNQUFDLE1BQU0sQ0FBQyxLQUFrQixtQ0FBSSxFQUFFLENBQUM7UUFDckQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUVqQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO1FBRWhELHdEQUF3RDtRQUN4RCxPQUFPLElBQUEsa0JBQWlCLEVBQ3RCLEdBQUcsRUFDSCxzQkFBc0IsS0FBSyxrQkFBa0IsRUFDN0MsV0FBVyxDQUFDLDBDQUEwQztTQUN2RCxDQUFDO0lBRUosQ0FBQztJQUFDLE9BQU8sS0FBYyxFQUFFLENBQUM7UUFDeEIsSUFBSSxZQUFZLEdBQUcsMkJBQTJCLENBQUM7UUFDL0MsSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFLENBQUM7WUFDM0IsWUFBWSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDL0IsQ0FBQzthQUFNLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDckMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUN2QixDQUFDO1FBQ0EseUJBQXlCO1FBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLFlBQVksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZFLHNEQUFzRDtRQUN0RCw4RkFBOEY7UUFDOUYsT0FBTyxJQUFBLGtCQUFpQixFQUN0QixHQUFHLEVBQ0gsZ0NBQWdDLFlBQVksRUFBRSxFQUM5QyxJQUFJLENBQ0wsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDLENBQUM7QUFFRiwrREFBK0Q7QUFDL0Qsa0JBQWUsY0FBYyxDQUFDO0FBRTlCLGdEQUFnRDtBQUNoRCw2QkFBNkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSBcImF3cy1zZGtcIjtcbmltcG9ydCB7IERvY3VtZW50Q2xpZW50IH0gZnJvbSBcImF3cy1zZGsvY2xpZW50cy9keW5hbW9kYlwiO1xuLy8gQXNzdW1pbmcgY3JlYXRlQXBpUmVzcG9uc2UgZXhpc3RzIGFuZCBwb3RlbnRpYWxseSBleHBvcnRzIGl0cyByZXR1cm4gdHlwZVxuaW1wb3J0IGNyZWF0ZUFwaVJlc3BvbnNlIGZyb20gXCIuLi91dGlscy9yZXNwb25zZVwiO1xuaW1wb3J0IHsgQXBpUmVzcG9uc2UgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuLy8gLS0tIENvbmZpZ3VyYXRpb24gLS0tXG5jb25zdCBQQUxMRVRTX1RBQkxFX05BTUUgPSBwcm9jZXNzLmVudi5QQUxMRVRTX1RBQkxFIHx8IFwiUGFsbGV0c1wiO1xuXG4vLyAtLS0gSW50ZXJmYWNlcyAtLS1cblxuLy8gRGVmaW5lIHRoZSBzdHJ1Y3R1cmUgb2YgYSBQYWxsZXQgaXRlbSBiYXNlZCBvbiB1c2FnZSBhbmQgYXNzdW1wdGlvbnNcbmludGVyZmFjZSBQYWxsZXQge1xuICBjb2RpZ286IHN0cmluZzsgLy8gQXNzdW1pbmcgJ2NvZGlnbycgaXMgdGhlIHByaW1hcnkga2V5IGJhc2VkIG9uIG90aGVyIGV4YW1wbGVzXG4gIGVzdGFkbzogc3RyaW5nOyAvLyBUaGUgc3RhdHVzIGZpZWxkIHVzZWQgaW4gdGhlIGZpbHRlclxuICAvLyBBZGQgb3RoZXIgcG90ZW50aWFsIHByb3BlcnRpZXMgb2YgYSBQYWxsZXRcbiAgY2FqYXM/OiBzdHJpbmdbXTtcbiAgY2FudGlkYWRDYWphcz86IG51bWJlcjtcbiAgLy8gLi4uIG90aGVyIGZpZWxkc1xufVxuXG4vKlxuICogUGxhY2Vob2xkZXIgdHlwZSBkZWZpbml0aW9uIGZvciB0aGUgaW1wb3J0ZWQgdXRpbGl0eSdzIHJlc3BvbnNlLlxuICogQWRqdXN0IHRoaXMgaW50ZXJmYWNlIGJhc2VkIG9uIHRoZSBhY3R1YWwgc3RydWN0dXJlIHJldHVybmVkIGJ5IGNyZWF0ZUFwaVJlc3BvbnNlLlxuICogRXhhbXBsZSBhc3N1bWVzIGEgc3RydWN0dXJlIHN1aXRhYmxlIGZvciBBUEkgR2F0ZXdheSBMYW1iZGEgUHJveHkgaW50ZWdyYXRpb24uXG4gKi9cbi8qIC8vIC0tPiBJZiBBcGlSZXNwb25zZSBpcyBOT1QgZXhwb3J0ZWQgZnJvbSAuLi91dGlscy9yZXNwb25zZSwgZGVmaW5lIGl0IGhlcmU6XG5pbnRlcmZhY2UgQXBpUmVzcG9uc2Uge1xuICBzdGF0dXNDb2RlOiBudW1iZXI7XG4gIGJvZHk6IHN0cmluZzsgLy8gVXN1YWxseSBhIEpTT04gc3RyaW5naWZpZWQgb2JqZWN0XG4gIGhlYWRlcnM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xufVxuKi9cblxuLypcbiAqIFBsYWNlaG9sZGVyIHR5cGUgZGVmaW5pdGlvbiBmb3IgdGhlIGltcG9ydGVkIHV0aWxpdHkgZnVuY3Rpb24uXG4gKiBBZGp1c3QgaWYgdGhlIGFjdHVhbCBzaWduYXR1cmUgaXMgZGlmZmVyZW50IG9yIGlmIHR5cGVzIGFyZSBleHBvcnRlZCBmcm9tIHRoZSB1dGlsaXR5IGZpbGUuXG4gKi9cbi8qIC8vIC0tPiBJZiBjcmVhdGVBcGlSZXNwb25zZSB0eXBlIGlzIE5PVCBleHBvcnRlZCwgZGVmaW5lIGl0cyBzaWduYXR1cmU6XG50eXBlIENyZWF0ZUFwaVJlc3BvbnNlRm4gPSAoXG4gICAgc3RhdHVzQ29kZTogbnVtYmVyLFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBkYXRhPzogYW55IC8vIE9yIHNwZWNpZnkgYSBtb3JlIGNvbmNyZXRlIHR5cGUgbGlrZSBQYWxsZXRbXSB8IG51bGxcbikgPT4gQXBpUmVzcG9uc2U7XG4qL1xuXG4vLyBBc3N1bWUgJ2NyZWF0ZUFwaVJlc3BvbnNlJyBpcyBwcm9wZXJseSB0eXBlZCBpbiBpdHMgb3duIGZpbGUgYW5kIGV4cG9ydGVkLlxuLy8gSWYgbm90LCB5b3UgbWlnaHQgbmVlZCBjYXN0aW5nIG9yIHRoZSBkZWZpbml0aW9ucyBhYm92ZS5cblxuLy8gLS0tIEFXUyBTREsgU2V0dXAgLS0tXG5jb25zdCBkeW5hbW9EQiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuLyoqXG4gKiBGZXRjaGVzIGFsbCBvcGVuIHBhbGxldHMgZnJvbSB0aGUgXCJQYWxsZXRzXCIgdGFibGUgdXNpbmcgYSBTY2FuIG9wZXJhdGlvbi5cbiAqIE5vdGU6IFNjYW5zIGNhbiBiZSBpbmVmZmljaWVudCBhbmQgY29zdGx5IG9uIGxhcmdlIHRhYmxlcy4gQ29uc2lkZXIgdXNpbmcgYVxuICogR2xvYmFsIFNlY29uZGFyeSBJbmRleCAoR1NJKSBvbiB0aGUgJ2VzdGFkbycgZmllbGQgaWYgcGVyZm9ybWFuY2UgYmVjb21lcyBhbiBpc3N1ZS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFwaVJlc3BvbnNlPn0gQW4gQVBJLXN0eWxlIHJlc3BvbnNlIG9iamVjdC5cbiAqL1xuY29uc3QgZ2V0T3BlblBhbGxldHMgPSBhc3luYyAoKTogUHJvbWlzZTxBcGlSZXNwb25zZT4gPT4ge1xuICBjb25zb2xlLmxvZyhg8J+UjSBBdHRlbXB0aW5nIHRvIGZldGNoIG9wZW4gcGFsbGV0cyBmcm9tICR7UEFMTEVUU19UQUJMRV9OQU1FfWApO1xuXG4gIHRyeSB7XG4gICAgLy8gMSkgRGVmaW5lIHBhcmFtZXRlcnMgZm9yIHNjYW5uaW5nIG9ubHkgaXRlbXMgd2hlcmUgZXN0YWRvID0gJ29wZW4nXG4gICAgY29uc3QgcGFyYW1zOiBEb2N1bWVudENsaWVudC5TY2FuSW5wdXQgPSB7XG4gICAgICBUYWJsZU5hbWU6IFBBTExFVFNfVEFCTEVfTkFNRSxcbiAgICAgIC8vIEZpbHRlciBleHByZXNzaW9uIHRvIGdldCBvbmx5IG9wZW4gcGFsbGV0c1xuICAgICAgRmlsdGVyRXhwcmVzc2lvbjogXCIjc3RhdHVzQXR0cmlidXRlID0gOm9wZW5TdGF0dXNWYWx1ZVwiLFxuICAgICAgLy8gTWFwICcjc3RhdHVzQXR0cmlidXRlJyBwbGFjZWhvbGRlciB0byB0aGUgYWN0dWFsIGF0dHJpYnV0ZSBuYW1lICdlc3RhZG8nXG4gICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgXCIjc3RhdHVzQXR0cmlidXRlXCI6IFwiZXN0YWRvXCIsXG4gICAgICB9LFxuICAgICAgLy8gTWFwICc6b3BlblN0YXR1c1ZhbHVlJyBwbGFjZWhvbGRlciB0byB0aGUgYWN0dWFsIHZhbHVlICdvcGVuJ1xuICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICBcIjpvcGVuU3RhdHVzVmFsdWVcIjogXCJvcGVuXCIsXG4gICAgICB9LFxuICAgICAgLy8gT3B0aW9uYWxseSBhZGQgUHJvamVjdGlvbkV4cHJlc3Npb24gdG8gcmV0cmlldmUgb25seSBuZWNlc3NhcnkgYXR0cmlidXRlc1xuICAgICAgLy8gUHJvamVjdGlvbkV4cHJlc3Npb246IFwiY29kaWdvLCBlc3RhZG8sIC8qIG90aGVyIG5lZWRlZCBhdHRyaWJ1dGVzICovXCJcbiAgICB9O1xuXG4gICAgLy8gMikgUGVyZm9ybSB0aGUgc2NhbiBvcGVyYXRpb24gb24gRHluYW1vREJcbiAgICBjb25zdCByZXN1bHQ6IERvY3VtZW50Q2xpZW50LlNjYW5PdXRwdXQgPSBhd2FpdCBkeW5hbW9EQi5zY2FuKHBhcmFtcykucHJvbWlzZSgpO1xuXG4gICAgLy8gU2FmZWx5IGFjY2VzcyBJdGVtcywgZGVmYXVsdGluZyB0byBhbiBlbXB0eSBhcnJheSBpZiB1bmRlZmluZWQvbnVsbFxuICAgIGNvbnN0IG9wZW5QYWxsZXRzID0gKHJlc3VsdC5JdGVtcyBhcyBQYWxsZXRbXSkgPz8gW107XG4gICAgY29uc3QgY291bnQgPSBvcGVuUGFsbGV0cy5sZW5ndGg7XG5cbiAgICBjb25zb2xlLmxvZyhg4pyFIEZvdW5kICR7Y291bnR9IG9wZW4gcGFsbGV0KHMpLmApO1xuXG4gICAgLy8gMykgUmV0dXJuIHN1Y2Nlc3MgcmVzcG9uc2UgdXNpbmcgdGhlIHV0aWxpdHkgZnVuY3Rpb25cbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoXG4gICAgICAyMDAsXG4gICAgICBgU3VjY2Vzc2Z1bGx5IGZvdW5kICR7Y291bnR9IG9wZW4gcGFsbGV0KHMpLmAsXG4gICAgICBvcGVuUGFsbGV0cyAvLyBQYXNzIHRoZSBhcnJheSBvZiBmb3VuZCBwYWxsZXRzIGFzIGRhdGFcbiAgICApO1xuXG4gIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgbGV0IGVycm9yTWVzc2FnZSA9IFwiQW4gdW5rbm93biBlcnJvciBvY2N1cnJlZFwiO1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBlcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykge1xuICAgICAgZXJyb3JNZXNzYWdlID0gZXJyb3I7XG4gICAgfVxuICAgICAvLyBMb2cgdGhlIGRldGFpbGVkIGVycm9yXG4gICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yIGZldGNoaW5nIG9wZW4gcGFsbGV0czogJHtlcnJvck1lc3NhZ2V9YCwgZXJyb3IpO1xuXG4gICAgLy8gNCkgUmV0dXJuIGVycm9yIHJlc3BvbnNlIHVzaW5nIHRoZSB1dGlsaXR5IGZ1bmN0aW9uXG4gICAgLy8gUGFzcyBudWxsIG9yIHVuZGVmaW5lZCBmb3IgZGF0YSBpbiBjYXNlIG9mIGVycm9yLCBkZXBlbmRpbmcgb24gY3JlYXRlQXBpUmVzcG9uc2UgZGVmaW5pdGlvblxuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZShcbiAgICAgIDUwMCxcbiAgICAgIGBFcnJvciBmZXRjaGluZyBvcGVuIHBhbGxldHM6ICR7ZXJyb3JNZXNzYWdlfWAsXG4gICAgICBudWxsXG4gICAgKTtcbiAgfVxufTtcblxuLy8gVXNlIGRlZmF1bHQgZXhwb3J0IGFzIGltcGxpZWQgYnkgdGhlIG9yaWdpbmFsIG1vZHVsZS5leHBvcnRzXG5leHBvcnQgZGVmYXVsdCBnZXRPcGVuUGFsbGV0cztcblxuLy8gQWx0ZXJuYXRpdmVseSwgdXNlIG5hbWVkIGV4cG9ydCBpZiBwcmVmZXJyZWQ6XG4vLyBleHBvcnQgeyBnZXRPcGVuUGFsbGV0cyB9OyJdfQ==