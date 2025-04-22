"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePalletLocation = updatePalletLocation;
exports.updatePalletStatus = updatePalletStatus;
exports.addBoxToPallet = addBoxToPallet;
const dynamoDb_1 = __importDefault(require("../../utils/dynamoDb"));
/**
 * Updates a pallet's location
 * @param codigo - The pallet code
 * @param location - The new location
 * @returns The updated pallet
 */
async function updatePalletLocation(codigo, location) {
    const now = new Date().toISOString();
    const params = {
        TableName: process.env.PALLETS_TABLE || 'Pallets',
        Key: { codigo },
        UpdateExpression: 'set #location = :location, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
            '#location': 'location'
        },
        ExpressionAttributeValues: {
            ':location': location,
            ':updatedAt': now
        },
        ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await dynamoDb_1.default.update(params);
    return Attributes;
}
/**
 * Updates a pallet's status
 * @param codigo - The pallet code
 * @param status - The new status (ACTIVE or CLOSED)
 * @returns The updated pallet
 */
async function updatePalletStatus(codigo, status) {
    const now = new Date().toISOString();
    const params = {
        TableName: process.env.PALLETS_TABLE || 'Pallets',
        Key: { codigo },
        UpdateExpression: 'set #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':status': status,
            ':updatedAt': now
        },
        ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await dynamoDb_1.default.update(params);
    return Attributes;
}
/**
 * Adds a box to a pallet
 * @param palletCodigo - The pallet code
 * @param boxCodigo - The box code to add
 * @returns The updated pallet
 */
async function addBoxToPallet(palletCodigo, boxCodigo) {
    const now = new Date().toISOString();
    const params = {
        TableName: process.env.PALLETS_TABLE || 'Pallets',
        Key: { codigo: palletCodigo },
        UpdateExpression: 'set boxes = list_append(if_not_exists(boxes, :empty_list), :box), boxCount = boxCount + :inc, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
            ':box': [boxCodigo],
            ':empty_list': [],
            ':inc': 1,
            ':updatedAt': now
        },
        ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await dynamoDb_1.default.update(params);
    return Attributes;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvcGFsbGV0cy91cGRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFvRkUsb0RBQW9CO0FBQ3BCLGdEQUFrQjtBQUNsQix3Q0FBYztBQXRGaEIsb0VBQTRDO0FBRzVDOzs7OztHQUtHO0FBQ0gsS0FBSyxVQUFVLG9CQUFvQixDQUFDLE1BQWMsRUFBRSxRQUFrQjtJQUNwRSxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBRXJDLE1BQU0sTUFBTSxHQUFHO1FBQ2IsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLFNBQVM7UUFDakQsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFO1FBQ2YsZ0JBQWdCLEVBQUUsbURBQW1EO1FBQ3JFLHdCQUF3QixFQUFFO1lBQ3hCLFdBQVcsRUFBRSxVQUFVO1NBQ3hCO1FBQ0QseUJBQXlCLEVBQUU7WUFDekIsV0FBVyxFQUFFLFFBQVE7WUFDckIsWUFBWSxFQUFFLEdBQUc7U0FDbEI7UUFDRCxZQUFZLEVBQUUsU0FBUztLQUN4QixDQUFDO0lBRUYsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLE1BQU0sa0JBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckQsT0FBTyxVQUFvQixDQUFDO0FBQzlCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxNQUFjLEVBQUUsTUFBMkI7SUFDM0UsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUVyQyxNQUFNLE1BQU0sR0FBRztRQUNiLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTO1FBQ2pELEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRTtRQUNmLGdCQUFnQixFQUFFLCtDQUErQztRQUNqRSx3QkFBd0IsRUFBRTtZQUN4QixTQUFTLEVBQUUsUUFBUTtTQUNwQjtRQUNELHlCQUF5QixFQUFFO1lBQ3pCLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLFlBQVksRUFBRSxHQUFHO1NBQ2xCO1FBQ0QsWUFBWSxFQUFFLFNBQVM7S0FDeEIsQ0FBQztJQUVGLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLGtCQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELE9BQU8sVUFBb0IsQ0FBQztBQUM5QixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxLQUFLLFVBQVUsY0FBYyxDQUFDLFlBQW9CLEVBQUUsU0FBaUI7SUFDbkUsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUVyQyxNQUFNLE1BQU0sR0FBRztRQUNiLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTO1FBQ2pELEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUU7UUFDN0IsZ0JBQWdCLEVBQUUsc0hBQXNIO1FBQ3hJLHlCQUF5QixFQUFFO1lBQ3pCLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNuQixhQUFhLEVBQUUsRUFBRTtZQUNqQixNQUFNLEVBQUUsQ0FBQztZQUNULFlBQVksRUFBRSxHQUFHO1NBQ2xCO1FBQ0QsWUFBWSxFQUFFLFNBQVM7S0FDeEIsQ0FBQztJQUVGLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLGtCQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELE9BQU8sVUFBb0IsQ0FBQztBQUM5QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGR5bmFtb0RiIGZyb20gJy4uLy4uL3V0aWxzL2R5bmFtb0RiJztcbmltcG9ydCB7IExvY2F0aW9uLCBQYWxsZXQsIER5bmFtb0RiSXRlbSB9IGZyb20gJy4uLy4uL3R5cGVzJztcblxuLyoqXG4gKiBVcGRhdGVzIGEgcGFsbGV0J3MgbG9jYXRpb25cbiAqIEBwYXJhbSBjb2RpZ28gLSBUaGUgcGFsbGV0IGNvZGVcbiAqIEBwYXJhbSBsb2NhdGlvbiAtIFRoZSBuZXcgbG9jYXRpb25cbiAqIEByZXR1cm5zIFRoZSB1cGRhdGVkIHBhbGxldFxuICovXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVQYWxsZXRMb2NhdGlvbihjb2RpZ286IHN0cmluZywgbG9jYXRpb246IExvY2F0aW9uKTogUHJvbWlzZTxQYWxsZXQ+IHtcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICBcbiAgY29uc3QgcGFyYW1zID0ge1xuICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUEFMTEVUU19UQUJMRSB8fCAnUGFsbGV0cycsXG4gICAgS2V5OiB7IGNvZGlnbyB9LFxuICAgIFVwZGF0ZUV4cHJlc3Npb246ICdzZXQgI2xvY2F0aW9uID0gOmxvY2F0aW9uLCB1cGRhdGVkQXQgPSA6dXBkYXRlZEF0JyxcbiAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICcjbG9jYXRpb24nOiAnbG9jYXRpb24nXG4gICAgfSxcbiAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAnOmxvY2F0aW9uJzogbG9jYXRpb24sXG4gICAgICAnOnVwZGF0ZWRBdCc6IG5vd1xuICAgIH0sXG4gICAgUmV0dXJuVmFsdWVzOiAnQUxMX05FVydcbiAgfTtcblxuICBjb25zdCB7IEF0dHJpYnV0ZXMgfSA9IGF3YWl0IGR5bmFtb0RiLnVwZGF0ZShwYXJhbXMpO1xuICByZXR1cm4gQXR0cmlidXRlcyBhcyBQYWxsZXQ7XG59XG5cbi8qKlxuICogVXBkYXRlcyBhIHBhbGxldCdzIHN0YXR1c1xuICogQHBhcmFtIGNvZGlnbyAtIFRoZSBwYWxsZXQgY29kZVxuICogQHBhcmFtIHN0YXR1cyAtIFRoZSBuZXcgc3RhdHVzIChBQ1RJVkUgb3IgQ0xPU0VEKVxuICogQHJldHVybnMgVGhlIHVwZGF0ZWQgcGFsbGV0XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVBhbGxldFN0YXR1cyhjb2RpZ286IHN0cmluZywgc3RhdHVzOiAnQUNUSVZFJyB8ICdDTE9TRUQnKTogUHJvbWlzZTxQYWxsZXQ+IHtcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICBcbiAgY29uc3QgcGFyYW1zID0ge1xuICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUEFMTEVUU19UQUJMRSB8fCAnUGFsbGV0cycsXG4gICAgS2V5OiB7IGNvZGlnbyB9LFxuICAgIFVwZGF0ZUV4cHJlc3Npb246ICdzZXQgI3N0YXR1cyA9IDpzdGF0dXMsIHVwZGF0ZWRBdCA9IDp1cGRhdGVkQXQnLFxuICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgJyNzdGF0dXMnOiAnc3RhdHVzJ1xuICAgIH0sXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgJzpzdGF0dXMnOiBzdGF0dXMsXG4gICAgICAnOnVwZGF0ZWRBdCc6IG5vd1xuICAgIH0sXG4gICAgUmV0dXJuVmFsdWVzOiAnQUxMX05FVydcbiAgfTtcblxuICBjb25zdCB7IEF0dHJpYnV0ZXMgfSA9IGF3YWl0IGR5bmFtb0RiLnVwZGF0ZShwYXJhbXMpO1xuICByZXR1cm4gQXR0cmlidXRlcyBhcyBQYWxsZXQ7XG59XG5cbi8qKlxuICogQWRkcyBhIGJveCB0byBhIHBhbGxldFxuICogQHBhcmFtIHBhbGxldENvZGlnbyAtIFRoZSBwYWxsZXQgY29kZVxuICogQHBhcmFtIGJveENvZGlnbyAtIFRoZSBib3ggY29kZSB0byBhZGRcbiAqIEByZXR1cm5zIFRoZSB1cGRhdGVkIHBhbGxldFxuICovXG5hc3luYyBmdW5jdGlvbiBhZGRCb3hUb1BhbGxldChwYWxsZXRDb2RpZ286IHN0cmluZywgYm94Q29kaWdvOiBzdHJpbmcpOiBQcm9taXNlPFBhbGxldD4ge1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gIFxuICBjb25zdCBwYXJhbXMgPSB7XG4gICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QQUxMRVRTX1RBQkxFIHx8ICdQYWxsZXRzJyxcbiAgICBLZXk6IHsgY29kaWdvOiBwYWxsZXRDb2RpZ28gfSxcbiAgICBVcGRhdGVFeHByZXNzaW9uOiAnc2V0IGJveGVzID0gbGlzdF9hcHBlbmQoaWZfbm90X2V4aXN0cyhib3hlcywgOmVtcHR5X2xpc3QpLCA6Ym94KSwgYm94Q291bnQgPSBib3hDb3VudCArIDppbmMsIHVwZGF0ZWRBdCA9IDp1cGRhdGVkQXQnLFxuICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICc6Ym94JzogW2JveENvZGlnb10sXG4gICAgICAnOmVtcHR5X2xpc3QnOiBbXSxcbiAgICAgICc6aW5jJzogMSxcbiAgICAgICc6dXBkYXRlZEF0Jzogbm93XG4gICAgfSxcbiAgICBSZXR1cm5WYWx1ZXM6ICdBTExfTkVXJ1xuICB9O1xuXG4gIGNvbnN0IHsgQXR0cmlidXRlcyB9ID0gYXdhaXQgZHluYW1vRGIudXBkYXRlKHBhcmFtcyk7XG4gIHJldHVybiBBdHRyaWJ1dGVzIGFzIFBhbGxldDtcbn1cblxuZXhwb3J0IHtcbiAgdXBkYXRlUGFsbGV0TG9jYXRpb24sXG4gIHVwZGF0ZVBhbGxldFN0YXR1cyxcbiAgYWRkQm94VG9QYWxsZXRcbn07ICJdfQ==