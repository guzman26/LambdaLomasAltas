"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../../utils/response"));
/**
 * Gets the system dashboard data
 */
const getSystemDashboard = async () => {
    console.log('Mock: Getting system dashboard');
    return (0, response_1.default)(200, 'System dashboard', {
        totalBoxes: 0,
        totalPallets: 0,
        activePallets: 0,
        boxesByLocation: {
            PACKING: 0,
            BODEGA: 0,
            VENTA: 0,
            TRANSITO: 0
        }
    });
};
exports.default = {
    getSystemDashboard
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9jb250cm9sbGVycy9hZG1pbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLG9FQUFxRDtBQUVyRDs7R0FFRztBQUNILE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxJQUEwQixFQUFFO0lBQzFELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUM5QyxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFFO1FBQ2hELFVBQVUsRUFBRSxDQUFDO1FBQ2IsWUFBWSxFQUFFLENBQUM7UUFDZixhQUFhLEVBQUUsQ0FBQztRQUNoQixlQUFlLEVBQUU7WUFDZixPQUFPLEVBQUUsQ0FBQztZQUNWLE1BQU0sRUFBRSxDQUFDO1lBQ1QsS0FBSyxFQUFFLENBQUM7WUFDUixRQUFRLEVBQUUsQ0FBQztTQUNaO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsa0JBQWU7SUFDYixrQkFBa0I7Q0FDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwaVJlc3BvbnNlIH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuaW1wb3J0IGNyZWF0ZUFwaVJlc3BvbnNlIGZyb20gJy4uLy4uL3V0aWxzL3Jlc3BvbnNlJztcblxuLyoqXG4gKiBHZXRzIHRoZSBzeXN0ZW0gZGFzaGJvYXJkIGRhdGFcbiAqL1xuY29uc3QgZ2V0U3lzdGVtRGFzaGJvYXJkID0gYXN5bmMgKCk6IFByb21pc2U8QXBpUmVzcG9uc2U+ID0+IHtcbiAgY29uc29sZS5sb2coJ01vY2s6IEdldHRpbmcgc3lzdGVtIGRhc2hib2FyZCcpO1xuICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCAnU3lzdGVtIGRhc2hib2FyZCcsIHtcbiAgICB0b3RhbEJveGVzOiAwLFxuICAgIHRvdGFsUGFsbGV0czogMCxcbiAgICBhY3RpdmVQYWxsZXRzOiAwLFxuICAgIGJveGVzQnlMb2NhdGlvbjoge1xuICAgICAgUEFDS0lORzogMCxcbiAgICAgIEJPREVHQTogMCxcbiAgICAgIFZFTlRBOiAwLFxuICAgICAgVFJBTlNJVE86IDBcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBnZXRTeXN0ZW1EYXNoYm9hcmRcbn07ICJdfQ==