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
exports.default = {
    getAllPallets: exports.getAllPallets,
    getActivePallets: exports.getActivePallets,
    getClosedPallets: exports.getClosedPallets
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbnRyb2xsZXJzL3BhbGxldHMvcmVhZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxvRUFBcUQ7QUFDckQsb0VBQTRDO0FBRTVDOztHQUVHO0FBQ0ksTUFBTSxhQUFhLEdBQUcsS0FBSyxJQUEwQixFQUFFO0lBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUVuQyxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxrQkFBUSxDQUFDLElBQUksQ0FBQztZQUNwQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUztTQUNsRCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRyxLQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztBQUNILENBQUMsQ0FBQztBQWJXLFFBQUEsYUFBYSxpQkFheEI7QUFFRjs7R0FFRztBQUNJLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxJQUEwQixFQUFFO0lBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUV0QyxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxrQkFBUSxDQUFDLElBQUksQ0FBQztZQUNwQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUztZQUNqRCxnQkFBZ0IsRUFBRSxtQkFBbUI7WUFDckMsd0JBQXdCLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxRQUFRO2FBQ3BCO1lBQ0QseUJBQXlCLEVBQUU7Z0JBQ3pCLFNBQVMsRUFBRSxNQUFNO2FBQ2xCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRyxLQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztBQUNILENBQUMsQ0FBQztBQXBCVyxRQUFBLGdCQUFnQixvQkFvQjNCO0FBRUY7O0dBRUc7QUFDSSxNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFBRSxTQUFrQixFQUF3QixFQUFFO0lBQ2pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUUxRSxJQUFJLENBQUM7UUFDSCxJQUFJLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDO1FBQzNDLElBQUkseUJBQXlCLEdBQXdCO1lBQ25ELFNBQVMsRUFBRSxRQUFRO1NBQ3BCLENBQUM7UUFFRixJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsZ0JBQWdCLElBQUksOEJBQThCLENBQUM7WUFDbkQseUJBQXlCLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDO1FBQ3RELENBQUM7UUFFRCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxrQkFBUSxDQUFDLElBQUksQ0FBQztZQUNwQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUztZQUNqRCxnQkFBZ0IsRUFBRSxnQkFBZ0I7WUFDbEMsd0JBQXdCLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxRQUFRO2dCQUNuQixZQUFZLEVBQUUsV0FBVzthQUMxQjtZQUNELHlCQUF5QixFQUFFLHlCQUF5QjtTQUNyRCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFHLEtBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBN0JXLFFBQUEsZ0JBQWdCLG9CQTZCM0I7QUFFRixrQkFBZTtJQUNiLGFBQWEsRUFBYixxQkFBYTtJQUNiLGdCQUFnQixFQUFoQix3QkFBZ0I7SUFDaEIsZ0JBQWdCLEVBQWhCLHdCQUFnQjtDQUNqQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBpUmVzcG9uc2UsIFBhbGxldCB9IGZyb20gJy4uLy4uL3R5cGVzJztcbmltcG9ydCBjcmVhdGVBcGlSZXNwb25zZSBmcm9tICcuLi8uLi91dGlscy9yZXNwb25zZSc7XG5pbXBvcnQgZHluYW1vRGIgZnJvbSAnLi4vLi4vdXRpbHMvZHluYW1vRGInO1xuXG4vKipcbiAqIEdldHMgYWxsIHBhbGxldHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFsbFBhbGxldHMgPSBhc3luYyAoKTogUHJvbWlzZTxBcGlSZXNwb25zZT4gPT4ge1xuICBjb25zb2xlLmxvZygnR2V0dGluZyBhbGwgcGFsbGV0cycpO1xuICBcbiAgdHJ5IHtcbiAgICBjb25zdCB7IEl0ZW1zIH0gPSBhd2FpdCBkeW5hbW9EYi5zY2FuKHtcbiAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUEFMTEVUU19UQUJMRSB8fCAnUGFsbGV0cycsXG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgJ0FsbCBwYWxsZXRzJywgSXRlbXMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgYWxsIHBhbGxldHM6JywgZXJyb3IpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg1MDAsIChlcnJvciBhcyBFcnJvcikubWVzc2FnZSk7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0cyBhY3RpdmUgcGFsbGV0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QWN0aXZlUGFsbGV0cyA9IGFzeW5jICgpOiBQcm9taXNlPEFwaVJlc3BvbnNlPiA9PiB7XG4gIGNvbnNvbGUubG9nKCdHZXR0aW5nIGFjdGl2ZSBwYWxsZXRzJyk7XG4gIFxuICB0cnkge1xuICAgIGNvbnN0IHsgSXRlbXMgfSA9IGF3YWl0IGR5bmFtb0RiLnNjYW4oe1xuICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QQUxMRVRTX1RBQkxFIHx8ICdQYWxsZXRzJyxcbiAgICAgIEZpbHRlckV4cHJlc3Npb246ICcjZXN0YWRvID0gOmFjdGl2ZScsXG4gICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgJyNlc3RhZG8nOiAnZXN0YWRvJ1xuICAgICAgfSxcbiAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgJzphY3RpdmUnOiAnb3BlbidcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCAnQWN0aXZlIHBhbGxldHMnLCBJdGVtcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBhY3RpdmUgcGFsbGV0czonLCBlcnJvcik7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBHZXRzIGNsb3NlZCBwYWxsZXRzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDbG9zZWRQYWxsZXRzID0gYXN5bmMgKHViaWNhY2lvbj86IHN0cmluZyk6IFByb21pc2U8QXBpUmVzcG9uc2U+ID0+IHtcbiAgY29uc29sZS5sb2coJ0dldHRpbmcgY2xvc2VkIHBhbGxldHMnLCB1YmljYWNpb24gPyBgYXQgJHt1YmljYWNpb259YCA6ICcnKTtcbiAgXG4gIHRyeSB7XG4gICAgbGV0IGZpbHRlckV4cHJlc3Npb24gPSAnI2VzdGFkbyA9IDpjbG9zZWQnO1xuICAgIGxldCBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge1xuICAgICAgJzpjbG9zZWQnOiAnY2xvc2VkJ1xuICAgIH07XG4gICAgXG4gICAgaWYgKHViaWNhY2lvbikge1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbiArPSAnIEFORCAjdWJpY2FjaW9uID0gOnViaWNhY2lvbic7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6dWJpY2FjaW9uJ10gPSB1YmljYWNpb247XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHsgSXRlbXMgfSA9IGF3YWl0IGR5bmFtb0RiLnNjYW4oe1xuICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QQUxMRVRTX1RBQkxFIHx8ICdQYWxsZXRzJyxcbiAgICAgIEZpbHRlckV4cHJlc3Npb246IGZpbHRlckV4cHJlc3Npb24sXG4gICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgJyNlc3RhZG8nOiAnZXN0YWRvJyxcbiAgICAgICAgJyN1YmljYWNpb24nOiAndWJpY2FjaW9uJ1xuICAgICAgfSxcbiAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCAnQ2xvc2VkIHBhbGxldHMnLCBJdGVtcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBjbG9zZWQgcGFsbGV0czonLCBlcnJvcik7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlKTtcbiAgfVxufTsgXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZ2V0QWxsUGFsbGV0cyxcbiAgZ2V0QWN0aXZlUGFsbGV0cyxcbiAgZ2V0Q2xvc2VkUGFsbGV0c1xufTsiXX0=