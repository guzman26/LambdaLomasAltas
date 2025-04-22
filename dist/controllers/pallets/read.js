"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClosedPallets = exports.getActivePallets = exports.getAllPallets = void 0;
const response_1 = __importDefault(require("../../utils/response"));
const dynamoDb_1 = __importDefault(require("../../utils/dynamoDb"));
/**
 * Gets all pallets
 */
const getAllPallets = async () => {
    console.log('Getting all pallets');
    try {
        const { Items } = await dynamoDb_1.default.scan({
            TableName: process.env.PALLETS_TABLE || 'Pallets',
        });
        return (0, response_1.default)(200, 'All pallets', Items);
    }
    catch (error) {
        console.error('Error getting all pallets:', error);
        return (0, response_1.default)(500, error.message);
    }
};
exports.getAllPallets = getAllPallets;
/**
 * Gets active pallets
 */
const getActivePallets = async () => {
    console.log('Getting active pallets');
    try {
        const { Items } = await dynamoDb_1.default.scan({
            TableName: process.env.PALLETS_TABLE || 'Pallets',
            FilterExpression: '#estado = :active',
            ExpressionAttributeNames: {
                '#estado': 'estado'
            },
            ExpressionAttributeValues: {
                ':active': 'open'
            }
        });
        return (0, response_1.default)(200, 'Active pallets', Items);
    }
    catch (error) {
        console.error('Error getting active pallets:', error);
        return (0, response_1.default)(500, error.message);
    }
};
exports.getActivePallets = getActivePallets;
/**
 * Gets closed pallets
 */
const getClosedPallets = async (ubicacion) => {
    console.log('Getting closed pallets', ubicacion ? `at ${ubicacion}` : '');
    try {
        let filterExpression = '#estado = :closed';
        let expressionAttributeValues = {
            ':closed': 'closed'
        };
        if (ubicacion) {
            filterExpression += ' AND #ubicacion = :ubicacion';
            expressionAttributeValues[':ubicacion'] = ubicacion;
        }
        const { Items } = await dynamoDb_1.default.scan({
            TableName: process.env.PALLETS_TABLE || 'Pallets',
            FilterExpression: filterExpression,
            ExpressionAttributeNames: {
                '#estado': 'estado',
                '#ubicacion': 'ubicacion'
            },
            ExpressionAttributeValues: expressionAttributeValues
        });
        return (0, response_1.default)(200, 'Closed pallets', Items);
    }
    catch (error) {
        console.error('Error getting closed pallets:', error);
        return (0, response_1.default)(500, error.message);
    }
};
exports.getClosedPallets = getClosedPallets;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbnRyb2xsZXJzL3BhbGxldHMvcmVhZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxvRUFBcUQ7QUFDckQsb0VBQTRDO0FBRTVDOztHQUVHO0FBQ0ksTUFBTSxhQUFhLEdBQUcsS0FBSyxJQUEwQixFQUFFO0lBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUVuQyxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxrQkFBUSxDQUFDLElBQUksQ0FBQztZQUNwQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUztTQUNsRCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRyxLQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztBQUNILENBQUMsQ0FBQztBQWJXLFFBQUEsYUFBYSxpQkFheEI7QUFFRjs7R0FFRztBQUNJLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxJQUEwQixFQUFFO0lBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUV0QyxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxrQkFBUSxDQUFDLElBQUksQ0FBQztZQUNwQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUztZQUNqRCxnQkFBZ0IsRUFBRSxtQkFBbUI7WUFDckMsd0JBQXdCLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxRQUFRO2FBQ3BCO1lBQ0QseUJBQXlCLEVBQUU7Z0JBQ3pCLFNBQVMsRUFBRSxNQUFNO2FBQ2xCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRyxLQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztBQUNILENBQUMsQ0FBQztBQXBCVyxRQUFBLGdCQUFnQixvQkFvQjNCO0FBRUY7O0dBRUc7QUFDSSxNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFBRSxTQUFrQixFQUF3QixFQUFFO0lBQ2pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUUxRSxJQUFJLENBQUM7UUFDSCxJQUFJLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDO1FBQzNDLElBQUkseUJBQXlCLEdBQXdCO1lBQ25ELFNBQVMsRUFBRSxRQUFRO1NBQ3BCLENBQUM7UUFFRixJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsZ0JBQWdCLElBQUksOEJBQThCLENBQUM7WUFDbkQseUJBQXlCLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDO1FBQ3RELENBQUM7UUFFRCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxrQkFBUSxDQUFDLElBQUksQ0FBQztZQUNwQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUztZQUNqRCxnQkFBZ0IsRUFBRSxnQkFBZ0I7WUFDbEMsd0JBQXdCLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxRQUFRO2dCQUNuQixZQUFZLEVBQUUsV0FBVzthQUMxQjtZQUNELHlCQUF5QixFQUFFLHlCQUF5QjtTQUNyRCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFHLEtBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBN0JXLFFBQUEsZ0JBQWdCLG9CQTZCM0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcGlSZXNwb25zZSwgUGFsbGV0IH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuaW1wb3J0IGNyZWF0ZUFwaVJlc3BvbnNlIGZyb20gJy4uLy4uL3V0aWxzL3Jlc3BvbnNlJztcbmltcG9ydCBkeW5hbW9EYiBmcm9tICcuLi8uLi91dGlscy9keW5hbW9EYic7XG5cbi8qKlxuICogR2V0cyBhbGwgcGFsbGV0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QWxsUGFsbGV0cyA9IGFzeW5jICgpOiBQcm9taXNlPEFwaVJlc3BvbnNlPiA9PiB7XG4gIGNvbnNvbGUubG9nKCdHZXR0aW5nIGFsbCBwYWxsZXRzJyk7XG4gIFxuICB0cnkge1xuICAgIGNvbnN0IHsgSXRlbXMgfSA9IGF3YWl0IGR5bmFtb0RiLnNjYW4oe1xuICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QQUxMRVRTX1RBQkxFIHx8ICdQYWxsZXRzJyxcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCAnQWxsIHBhbGxldHMnLCBJdGVtcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBhbGwgcGFsbGV0czonLCBlcnJvcik7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBHZXRzIGFjdGl2ZSBwYWxsZXRzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBY3RpdmVQYWxsZXRzID0gYXN5bmMgKCk6IFByb21pc2U8QXBpUmVzcG9uc2U+ID0+IHtcbiAgY29uc29sZS5sb2coJ0dldHRpbmcgYWN0aXZlIHBhbGxldHMnKTtcbiAgXG4gIHRyeSB7XG4gICAgY29uc3QgeyBJdGVtcyB9ID0gYXdhaXQgZHluYW1vRGIuc2Nhbih7XG4gICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBBTExFVFNfVEFCTEUgfHwgJ1BhbGxldHMnLFxuICAgICAgRmlsdGVyRXhwcmVzc2lvbjogJyNlc3RhZG8gPSA6YWN0aXZlJyxcbiAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAnI2VzdGFkbyc6ICdlc3RhZG8nXG4gICAgICB9LFxuICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAnOmFjdGl2ZSc6ICdvcGVuJ1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsICdBY3RpdmUgcGFsbGV0cycsIEl0ZW1zKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGFjdGl2ZSBwYWxsZXRzOicsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICB9XG59O1xuXG4vKipcbiAqIEdldHMgY2xvc2VkIHBhbGxldHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldENsb3NlZFBhbGxldHMgPSBhc3luYyAodWJpY2FjaW9uPzogc3RyaW5nKTogUHJvbWlzZTxBcGlSZXNwb25zZT4gPT4ge1xuICBjb25zb2xlLmxvZygnR2V0dGluZyBjbG9zZWQgcGFsbGV0cycsIHViaWNhY2lvbiA/IGBhdCAke3ViaWNhY2lvbn1gIDogJycpO1xuICBcbiAgdHJ5IHtcbiAgICBsZXQgZmlsdGVyRXhwcmVzc2lvbiA9ICcjZXN0YWRvID0gOmNsb3NlZCc7XG4gICAgbGV0IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG4gICAgICAnOmNsb3NlZCc6ICdjbG9zZWQnXG4gICAgfTtcbiAgICBcbiAgICBpZiAodWJpY2FjaW9uKSB7XG4gICAgICBmaWx0ZXJFeHByZXNzaW9uICs9ICcgQU5EICN1YmljYWNpb24gPSA6dWJpY2FjaW9uJztcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzp1YmljYWNpb24nXSA9IHViaWNhY2lvbjtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgeyBJdGVtcyB9ID0gYXdhaXQgZHluYW1vRGIuc2Nhbih7XG4gICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBBTExFVFNfVEFCTEUgfHwgJ1BhbGxldHMnLFxuICAgICAgRmlsdGVyRXhwcmVzc2lvbjogZmlsdGVyRXhwcmVzc2lvbixcbiAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAnI2VzdGFkbyc6ICdlc3RhZG8nLFxuICAgICAgICAnI3ViaWNhY2lvbic6ICd1YmljYWNpb24nXG4gICAgICB9LFxuICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1xuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsICdDbG9zZWQgcGFsbGV0cycsIEl0ZW1zKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGNsb3NlZCBwYWxsZXRzOicsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICB9XG59OyAiXX0=