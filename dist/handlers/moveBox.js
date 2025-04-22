"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../utils/response"));
/**
 * Moves a box to a new location
 * @param codigo - The box code
 * @param ubicacion - The new location
 * @returns API response
 */
async function moveBox(codigo, ubicacion) {
    try {
        console.log(`Mock implementation: Moving box ${codigo} to ${ubicacion}`);
        return (0, response_1.default)(200, `Box ${codigo} moved to ${ubicacion}`, { codigo, ubicacion });
    }
    catch (error) {
        console.error(`❌ Error moving box ${codigo}:`, error);
        return (0, response_1.default)(500, error.message);
    }
}
exports.default = moveBox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZUJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2hhbmRsZXJzL21vdmVCb3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxpRUFBa0Q7QUFFbEQ7Ozs7O0dBS0c7QUFDSCxLQUFLLFVBQVUsT0FBTyxDQUFDLE1BQWMsRUFBRSxTQUFtQjtJQUN4RCxJQUFJLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxNQUFNLE9BQU8sU0FBUyxFQUFFLENBQUMsQ0FBQztRQUN6RSxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLE9BQU8sTUFBTSxhQUFhLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixNQUFNLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFHLEtBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRCxDQUFDO0FBQ0gsQ0FBQztBQUVELGtCQUFlLE9BQU8sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwaVJlc3BvbnNlLCBMb2NhdGlvbiB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBjcmVhdGVBcGlSZXNwb25zZSBmcm9tICcuLi91dGlscy9yZXNwb25zZSc7XG5cbi8qKlxuICogTW92ZXMgYSBib3ggdG8gYSBuZXcgbG9jYXRpb25cbiAqIEBwYXJhbSBjb2RpZ28gLSBUaGUgYm94IGNvZGVcbiAqIEBwYXJhbSB1YmljYWNpb24gLSBUaGUgbmV3IGxvY2F0aW9uXG4gKiBAcmV0dXJucyBBUEkgcmVzcG9uc2VcbiAqL1xuYXN5bmMgZnVuY3Rpb24gbW92ZUJveChjb2RpZ286IHN0cmluZywgdWJpY2FjaW9uOiBMb2NhdGlvbik6IFByb21pc2U8QXBpUmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhgTW9jayBpbXBsZW1lbnRhdGlvbjogTW92aW5nIGJveCAke2NvZGlnb30gdG8gJHt1YmljYWNpb259YCk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgYEJveCAke2NvZGlnb30gbW92ZWQgdG8gJHt1YmljYWNpb259YCwgeyBjb2RpZ28sIHViaWNhY2lvbiB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgbW92aW5nIGJveCAke2NvZGlnb306YCwgZXJyb3IpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDAsIChlcnJvciBhcyBFcnJvcikubWVzc2FnZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbW92ZUJveDsgIl19