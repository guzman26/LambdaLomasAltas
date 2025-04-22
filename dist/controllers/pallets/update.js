"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = {
    updatePalletLocation,
    updatePalletStatus,
    addBoxToPallet
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvcGFsbGV0cy91cGRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvRUFBNEM7QUFHNUM7Ozs7O0dBS0c7QUFDSCxLQUFLLFVBQVUsb0JBQW9CLENBQUMsTUFBYyxFQUFFLFFBQWtCO0lBQ3BFLE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7SUFFckMsTUFBTSxNQUFNLEdBQUc7UUFDYixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUztRQUNqRCxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUU7UUFDZixnQkFBZ0IsRUFBRSxtREFBbUQ7UUFDckUsd0JBQXdCLEVBQUU7WUFDeEIsV0FBVyxFQUFFLFVBQVU7U0FDeEI7UUFDRCx5QkFBeUIsRUFBRTtZQUN6QixXQUFXLEVBQUUsUUFBUTtZQUNyQixZQUFZLEVBQUUsR0FBRztTQUNsQjtRQUNELFlBQVksRUFBRSxTQUFTO0tBQ3hCLENBQUM7SUFFRixNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxrQkFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyRCxPQUFPLFVBQW9CLENBQUM7QUFDOUIsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsS0FBSyxVQUFVLGtCQUFrQixDQUFDLE1BQWMsRUFBRSxNQUEyQjtJQUMzRSxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBRXJDLE1BQU0sTUFBTSxHQUFHO1FBQ2IsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLFNBQVM7UUFDakQsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFO1FBQ2YsZ0JBQWdCLEVBQUUsK0NBQStDO1FBQ2pFLHdCQUF3QixFQUFFO1lBQ3hCLFNBQVMsRUFBRSxRQUFRO1NBQ3BCO1FBQ0QseUJBQXlCLEVBQUU7WUFDekIsU0FBUyxFQUFFLE1BQU07WUFDakIsWUFBWSxFQUFFLEdBQUc7U0FDbEI7UUFDRCxZQUFZLEVBQUUsU0FBUztLQUN4QixDQUFDO0lBRUYsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLE1BQU0sa0JBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckQsT0FBTyxVQUFvQixDQUFDO0FBQzlCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILEtBQUssVUFBVSxjQUFjLENBQUMsWUFBb0IsRUFBRSxTQUFpQjtJQUNuRSxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBRXJDLE1BQU0sTUFBTSxHQUFHO1FBQ2IsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLFNBQVM7UUFDakQsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRTtRQUM3QixnQkFBZ0IsRUFBRSxzSEFBc0g7UUFDeEkseUJBQXlCLEVBQUU7WUFDekIsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDO1lBQ25CLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLE1BQU0sRUFBRSxDQUFDO1lBQ1QsWUFBWSxFQUFFLEdBQUc7U0FDbEI7UUFDRCxZQUFZLEVBQUUsU0FBUztLQUN4QixDQUFDO0lBRUYsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLE1BQU0sa0JBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckQsT0FBTyxVQUFvQixDQUFDO0FBQzlCLENBQUM7QUFFRCxrQkFBZTtJQUNiLG9CQUFvQjtJQUNwQixrQkFBa0I7SUFDbEIsY0FBYztDQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZHluYW1vRGIgZnJvbSAnLi4vLi4vdXRpbHMvZHluYW1vRGInO1xuaW1wb3J0IHsgTG9jYXRpb24sIFBhbGxldCwgRHluYW1vRGJJdGVtIH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuXG4vKipcbiAqIFVwZGF0ZXMgYSBwYWxsZXQncyBsb2NhdGlvblxuICogQHBhcmFtIGNvZGlnbyAtIFRoZSBwYWxsZXQgY29kZVxuICogQHBhcmFtIGxvY2F0aW9uIC0gVGhlIG5ldyBsb2NhdGlvblxuICogQHJldHVybnMgVGhlIHVwZGF0ZWQgcGFsbGV0XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVBhbGxldExvY2F0aW9uKGNvZGlnbzogc3RyaW5nLCBsb2NhdGlvbjogTG9jYXRpb24pOiBQcm9taXNlPFBhbGxldD4ge1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gIFxuICBjb25zdCBwYXJhbXMgPSB7XG4gICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QQUxMRVRTX1RBQkxFIHx8ICdQYWxsZXRzJyxcbiAgICBLZXk6IHsgY29kaWdvIH0sXG4gICAgVXBkYXRlRXhwcmVzc2lvbjogJ3NldCAjbG9jYXRpb24gPSA6bG9jYXRpb24sIHVwZGF0ZWRBdCA9IDp1cGRhdGVkQXQnLFxuICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgJyNsb2NhdGlvbic6ICdsb2NhdGlvbidcbiAgICB9LFxuICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICc6bG9jYXRpb24nOiBsb2NhdGlvbixcbiAgICAgICc6dXBkYXRlZEF0Jzogbm93XG4gICAgfSxcbiAgICBSZXR1cm5WYWx1ZXM6ICdBTExfTkVXJ1xuICB9O1xuXG4gIGNvbnN0IHsgQXR0cmlidXRlcyB9ID0gYXdhaXQgZHluYW1vRGIudXBkYXRlKHBhcmFtcyk7XG4gIHJldHVybiBBdHRyaWJ1dGVzIGFzIFBhbGxldDtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGEgcGFsbGV0J3Mgc3RhdHVzXG4gKiBAcGFyYW0gY29kaWdvIC0gVGhlIHBhbGxldCBjb2RlXG4gKiBAcGFyYW0gc3RhdHVzIC0gVGhlIG5ldyBzdGF0dXMgKEFDVElWRSBvciBDTE9TRUQpXG4gKiBAcmV0dXJucyBUaGUgdXBkYXRlZCBwYWxsZXRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gdXBkYXRlUGFsbGV0U3RhdHVzKGNvZGlnbzogc3RyaW5nLCBzdGF0dXM6ICdBQ1RJVkUnIHwgJ0NMT1NFRCcpOiBQcm9taXNlPFBhbGxldD4ge1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gIFxuICBjb25zdCBwYXJhbXMgPSB7XG4gICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5QQUxMRVRTX1RBQkxFIHx8ICdQYWxsZXRzJyxcbiAgICBLZXk6IHsgY29kaWdvIH0sXG4gICAgVXBkYXRlRXhwcmVzc2lvbjogJ3NldCAjc3RhdHVzID0gOnN0YXR1cywgdXBkYXRlZEF0ID0gOnVwZGF0ZWRBdCcsXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAnI3N0YXR1cyc6ICdzdGF0dXMnXG4gICAgfSxcbiAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAnOnN0YXR1cyc6IHN0YXR1cyxcbiAgICAgICc6dXBkYXRlZEF0Jzogbm93XG4gICAgfSxcbiAgICBSZXR1cm5WYWx1ZXM6ICdBTExfTkVXJ1xuICB9O1xuXG4gIGNvbnN0IHsgQXR0cmlidXRlcyB9ID0gYXdhaXQgZHluYW1vRGIudXBkYXRlKHBhcmFtcyk7XG4gIHJldHVybiBBdHRyaWJ1dGVzIGFzIFBhbGxldDtcbn1cblxuLyoqXG4gKiBBZGRzIGEgYm94IHRvIGEgcGFsbGV0XG4gKiBAcGFyYW0gcGFsbGV0Q29kaWdvIC0gVGhlIHBhbGxldCBjb2RlXG4gKiBAcGFyYW0gYm94Q29kaWdvIC0gVGhlIGJveCBjb2RlIHRvIGFkZFxuICogQHJldHVybnMgVGhlIHVwZGF0ZWQgcGFsbGV0XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGFkZEJveFRvUGFsbGV0KHBhbGxldENvZGlnbzogc3RyaW5nLCBib3hDb2RpZ286IHN0cmluZyk6IFByb21pc2U8UGFsbGV0PiB7XG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgXG4gIGNvbnN0IHBhcmFtcyA9IHtcbiAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBBTExFVFNfVEFCTEUgfHwgJ1BhbGxldHMnLFxuICAgIEtleTogeyBjb2RpZ286IHBhbGxldENvZGlnbyB9LFxuICAgIFVwZGF0ZUV4cHJlc3Npb246ICdzZXQgYm94ZXMgPSBsaXN0X2FwcGVuZChpZl9ub3RfZXhpc3RzKGJveGVzLCA6ZW1wdHlfbGlzdCksIDpib3gpLCBib3hDb3VudCA9IGJveENvdW50ICsgOmluYywgdXBkYXRlZEF0ID0gOnVwZGF0ZWRBdCcsXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgJzpib3gnOiBbYm94Q29kaWdvXSxcbiAgICAgICc6ZW1wdHlfbGlzdCc6IFtdLFxuICAgICAgJzppbmMnOiAxLFxuICAgICAgJzp1cGRhdGVkQXQnOiBub3dcbiAgICB9LFxuICAgIFJldHVyblZhbHVlczogJ0FMTF9ORVcnXG4gIH07XG5cbiAgY29uc3QgeyBBdHRyaWJ1dGVzIH0gPSBhd2FpdCBkeW5hbW9EYi51cGRhdGUocGFyYW1zKTtcbiAgcmV0dXJuIEF0dHJpYnV0ZXMgYXMgUGFsbGV0O1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHVwZGF0ZVBhbGxldExvY2F0aW9uLFxuICB1cGRhdGVQYWxsZXRTdGF0dXMsXG4gIGFkZEJveFRvUGFsbGV0XG59OyAiXX0=