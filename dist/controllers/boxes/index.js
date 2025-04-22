"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../../utils/response"));
// Mock implementation for read operations
const read = {
    getBoxesByLocation: async (location) => {
        console.log(`Mock: Getting boxes from location ${location}`);
        return (0, response_1.default)(200, `Boxes at ${location}`, []);
    },
    getBoxesByDate: async (date) => {
        console.log(`Mock: Getting boxes from date ${date}`);
        return (0, response_1.default)(200, `Boxes created on ${date}`, []);
    },
    getAllBoxes: async () => {
        console.log('Mock: Getting all boxes');
        return (0, response_1.default)(200, 'All boxes', []);
    },
    getBoxByCode: async (code) => {
        console.log(`Mock: Getting box with code ${code}`);
        return (0, response_1.default)(200, `Box ${code}`, {
            codigo: code,
            fechaCreacion: new Date().toISOString()
        });
    },
    getUnassignedBoxesInPacking: async () => {
        console.log('Mock: Getting unassigned boxes in packing');
        return (0, response_1.default)(200, 'Unassigned boxes in packing', []);
    }
};
exports.default = {
    read
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9jb250cm9sbGVycy9ib3hlcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLG9FQUFxRDtBQUVyRCwwQ0FBMEM7QUFDMUMsTUFBTSxJQUFJLEdBQUc7SUFDWCxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsUUFBa0IsRUFBRSxFQUFFO1FBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDN0QsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxZQUFZLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxjQUFjLEVBQUUsS0FBSyxFQUFFLElBQVksRUFBRSxFQUFFO1FBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxvQkFBb0IsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELFdBQVcsRUFBRSxLQUFLLElBQUksRUFBRTtRQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDdkMsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBWSxFQUFFLEVBQUU7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLE9BQU8sSUFBSSxFQUFFLEVBQUU7WUFDM0MsTUFBTSxFQUFFLElBQUk7WUFDWixhQUFhLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDeEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDJCQUEyQixFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUN6RCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLDZCQUE2QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25FLENBQUM7Q0FDRixDQUFDO0FBRUYsa0JBQWU7SUFDYixJQUFJO0NBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJveCwgTG9jYXRpb24gfSBmcm9tICcuLi8uLi90eXBlcyc7XG5pbXBvcnQgY3JlYXRlQXBpUmVzcG9uc2UgZnJvbSAnLi4vLi4vdXRpbHMvcmVzcG9uc2UnO1xuXG4vLyBNb2NrIGltcGxlbWVudGF0aW9uIGZvciByZWFkIG9wZXJhdGlvbnNcbmNvbnN0IHJlYWQgPSB7XG4gIGdldEJveGVzQnlMb2NhdGlvbjogYXN5bmMgKGxvY2F0aW9uOiBMb2NhdGlvbikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBNb2NrOiBHZXR0aW5nIGJveGVzIGZyb20gbG9jYXRpb24gJHtsb2NhdGlvbn1gKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBgQm94ZXMgYXQgJHtsb2NhdGlvbn1gLCBbXSk7XG4gIH0sXG4gIFxuICBnZXRCb3hlc0J5RGF0ZTogYXN5bmMgKGRhdGU6IHN0cmluZykgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBNb2NrOiBHZXR0aW5nIGJveGVzIGZyb20gZGF0ZSAke2RhdGV9YCk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgYEJveGVzIGNyZWF0ZWQgb24gJHtkYXRlfWAsIFtdKTtcbiAgfSxcbiAgXG4gIGdldEFsbEJveGVzOiBhc3luYyAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ01vY2s6IEdldHRpbmcgYWxsIGJveGVzJyk7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgJ0FsbCBib3hlcycsIFtdKTtcbiAgfSxcblxuICBnZXRCb3hCeUNvZGU6IGFzeW5jIChjb2RlOiBzdHJpbmcpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgTW9jazogR2V0dGluZyBib3ggd2l0aCBjb2RlICR7Y29kZX1gKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBgQm94ICR7Y29kZX1gLCB7XG4gICAgICBjb2RpZ286IGNvZGUsXG4gICAgICBmZWNoYUNyZWFjaW9uOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICB9KTtcbiAgfSxcblxuICBnZXRVbmFzc2lnbmVkQm94ZXNJblBhY2tpbmc6IGFzeW5jICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnTW9jazogR2V0dGluZyB1bmFzc2lnbmVkIGJveGVzIGluIHBhY2tpbmcnKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCAnVW5hc3NpZ25lZCBib3hlcyBpbiBwYWNraW5nJywgW10pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlYWRcbn07ICJdfQ==