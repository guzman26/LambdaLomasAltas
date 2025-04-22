"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../utils/response"));
/**
 * Registers a new box
 * @param codigo - The box code
 * @param palletId - Optional pallet ID to associate with the box
 * @param customInfo - Optional custom info for the box
 * @returns API response
 */
async function registerBox(codigo, palletId, customInfo, scannedCodes) {
    try {
        console.log(`Mock implementation: Registering box ${codigo}`);
        // If palletId is provided, associate the box with the pallet
        if (palletId) {
            console.log(`Associating box ${codigo} with pallet ${palletId}`);
        }
        return (0, response_1.default)(201, `Box ${codigo} registered successfully`, {
            codigo,
            palletId,
            customInfo,
            scannedCodes
        });
    }
    catch (error) {
        console.error(`❌ Error registering box ${codigo}:`, error);
        return (0, response_1.default)(500, error.message);
    }
}
exports.default = registerBox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXJCb3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9oYW5kbGVycy9yZWdpc3RlckJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLGlFQUFrRDtBQUVsRDs7Ozs7O0dBTUc7QUFDSCxLQUFLLFVBQVUsV0FBVyxDQUN4QixNQUFjLEVBQ2QsUUFBaUIsRUFDakIsVUFBbUIsRUFDbkIsWUFBdUI7SUFFdkIsSUFBSSxDQUFDO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUU5RCw2REFBNkQ7UUFDN0QsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLE1BQU0sZ0JBQWdCLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsT0FBTyxNQUFNLDBCQUEwQixFQUFFO1lBQ3JFLE1BQU07WUFDTixRQUFRO1lBQ1IsVUFBVTtZQUNWLFlBQVk7U0FDYixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLE1BQU0sR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNELE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUcsS0FBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFELENBQUM7QUFDSCxDQUFDO0FBRUQsa0JBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBpUmVzcG9uc2UgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgY3JlYXRlQXBpUmVzcG9uc2UgZnJvbSAnLi4vdXRpbHMvcmVzcG9uc2UnO1xuXG4vKipcbiAqIFJlZ2lzdGVycyBhIG5ldyBib3hcbiAqIEBwYXJhbSBjb2RpZ28gLSBUaGUgYm94IGNvZGVcbiAqIEBwYXJhbSBwYWxsZXRJZCAtIE9wdGlvbmFsIHBhbGxldCBJRCB0byBhc3NvY2lhdGUgd2l0aCB0aGUgYm94XG4gKiBAcGFyYW0gY3VzdG9tSW5mbyAtIE9wdGlvbmFsIGN1c3RvbSBpbmZvIGZvciB0aGUgYm94XG4gKiBAcmV0dXJucyBBUEkgcmVzcG9uc2VcbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXJCb3goXG4gIGNvZGlnbzogc3RyaW5nLCBcbiAgcGFsbGV0SWQ/OiBzdHJpbmcsIFxuICBjdXN0b21JbmZvPzogc3RyaW5nLFxuICBzY2FubmVkQ29kZXM/OiBzdHJpbmdbXVxuKTogUHJvbWlzZTxBcGlSZXNwb25zZT4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKGBNb2NrIGltcGxlbWVudGF0aW9uOiBSZWdpc3RlcmluZyBib3ggJHtjb2RpZ299YCk7XG4gICAgXG4gICAgLy8gSWYgcGFsbGV0SWQgaXMgcHJvdmlkZWQsIGFzc29jaWF0ZSB0aGUgYm94IHdpdGggdGhlIHBhbGxldFxuICAgIGlmIChwYWxsZXRJZCkge1xuICAgICAgY29uc29sZS5sb2coYEFzc29jaWF0aW5nIGJveCAke2NvZGlnb30gd2l0aCBwYWxsZXQgJHtwYWxsZXRJZH1gKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMSwgYEJveCAke2NvZGlnb30gcmVnaXN0ZXJlZCBzdWNjZXNzZnVsbHlgLCB7IFxuICAgICAgY29kaWdvLCBcbiAgICAgIHBhbGxldElkLCBcbiAgICAgIGN1c3RvbUluZm8sXG4gICAgICBzY2FubmVkQ29kZXMgXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yIHJlZ2lzdGVyaW5nIGJveCAke2NvZGlnb306YCwgZXJyb3IpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDAsIChlcnJvciBhcyBFcnJvcikubWVzc2FnZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVnaXN0ZXJCb3g7ICJdfQ==