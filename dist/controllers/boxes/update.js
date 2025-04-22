"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Box_1 = __importDefault(require("../../models/Box"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
/**
 * Updates an existing box record in the database
 *
 * @param {string} codigo - The codigo of the box to update
 * @param {Partial<Box>} updateData - The box data to be updated
 * @returns {Promise<Box>} - The updated box data
 */
const updateBox = async (codigo, updateData) => {
    try {
        // Create update expression and attribute values dynamically
        const updateExpressionParts = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        Object.keys(updateData).forEach(key => {
            updateExpressionParts.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = updateData[key];
        });
        // Always update the updatedAt timestamp
        updateExpressionParts.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();
        const params = {
            TableName: Box_1.default.getTableName(),
            Key: { codigo: codigo },
            UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };
        const result = await dynamoDB.update(params).promise();
        return result.Attributes;
    }
    catch (error) {
        console.error('Error updating box:', error);
        throw error;
    }
};
exports.default = updateBox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvYm94ZXMvdXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQTBCO0FBRTFCLDJEQUF3QztBQUV4QyxNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRW5EOzs7Ozs7R0FNRztBQUNILE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxNQUFjLEVBQUUsVUFBd0IsRUFBZ0IsRUFBRTtJQUNqRixJQUFJLENBQUM7UUFDSCw0REFBNEQ7UUFDNUQsTUFBTSxxQkFBcUIsR0FBYSxFQUFFLENBQUM7UUFDM0MsTUFBTSx3QkFBd0IsR0FBMkIsRUFBRSxDQUFDO1FBQzVELE1BQU0seUJBQXlCLEdBQXdCLEVBQUUsQ0FBQztRQUUxRCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNwQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNoRCx3QkFBd0IsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQzFDLHlCQUF5QixDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBeUIsQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQyxDQUFDO1FBRUgsd0NBQXdDO1FBQ3hDLHFCQUFxQixDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3RELHdCQUF3QixDQUFDLFlBQVksQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUNyRCx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRW5FLE1BQU0sTUFBTSxHQUFHO1lBQ2IsU0FBUyxFQUFFLGFBQVEsQ0FBQyxZQUFZLEVBQUU7WUFDbEMsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTtZQUN2QixnQkFBZ0IsRUFBRSxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMzRCx3QkFBd0IsRUFBRSx3QkFBd0I7WUFDbEQseUJBQXlCLEVBQUUseUJBQXlCO1lBQ3BELFlBQVksRUFBRSxTQUFTO1NBQ3hCLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkQsT0FBTyxNQUFNLENBQUMsVUFBaUIsQ0FBQztJQUNsQyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUMsTUFBTSxLQUFLLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsa0JBQWUsU0FBUyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB0eXBlIHsgQm94IH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuaW1wb3J0IEJveE1vZGVsIGZyb20gJy4uLy4uL21vZGVscy9Cb3gnO1xuXG5jb25zdCBkeW5hbW9EQiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuLyoqXG4gKiBVcGRhdGVzIGFuIGV4aXN0aW5nIGJveCByZWNvcmQgaW4gdGhlIGRhdGFiYXNlXG4gKiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2RpZ28gLSBUaGUgY29kaWdvIG9mIHRoZSBib3ggdG8gdXBkYXRlXG4gKiBAcGFyYW0ge1BhcnRpYWw8Qm94Pn0gdXBkYXRlRGF0YSAtIFRoZSBib3ggZGF0YSB0byBiZSB1cGRhdGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxCb3g+fSAtIFRoZSB1cGRhdGVkIGJveCBkYXRhXG4gKi9cbmNvbnN0IHVwZGF0ZUJveCA9IGFzeW5jIChjb2RpZ286IHN0cmluZywgdXBkYXRlRGF0YTogUGFydGlhbDxCb3g+KTogUHJvbWlzZTxCb3g+ID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBDcmVhdGUgdXBkYXRlIGV4cHJlc3Npb24gYW5kIGF0dHJpYnV0ZSB2YWx1ZXMgZHluYW1pY2FsbHlcbiAgICBjb25zdCB1cGRhdGVFeHByZXNzaW9uUGFydHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXModXBkYXRlRGF0YSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgdXBkYXRlRXhwcmVzc2lvblBhcnRzLnB1c2goYCMke2tleX0gPSA6JHtrZXl9YCk7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbYCMke2tleX1gXSA9IGtleTtcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbYDoke2tleX1gXSA9IHVwZGF0ZURhdGFba2V5IGFzIGtleW9mIFBhcnRpYWw8Qm94Pl07XG4gICAgfSk7XG5cbiAgICAvLyBBbHdheXMgdXBkYXRlIHRoZSB1cGRhdGVkQXQgdGltZXN0YW1wXG4gICAgdXBkYXRlRXhwcmVzc2lvblBhcnRzLnB1c2goJyN1cGRhdGVkQXQgPSA6dXBkYXRlZEF0Jyk7XG4gICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjdXBkYXRlZEF0J10gPSAndXBkYXRlZEF0JztcbiAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6dXBkYXRlZEF0J10gPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBUYWJsZU5hbWU6IEJveE1vZGVsLmdldFRhYmxlTmFtZSgpLFxuICAgICAgS2V5OiB7IGNvZGlnbzogY29kaWdvIH0sXG4gICAgICBVcGRhdGVFeHByZXNzaW9uOiBgU0VUICR7dXBkYXRlRXhwcmVzc2lvblBhcnRzLmpvaW4oJywgJyl9YCxcbiAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczogZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLFxuICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICAgIFJldHVyblZhbHVlczogJ0FMTF9ORVcnXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLnVwZGF0ZShwYXJhbXMpLnByb21pc2UoKTtcbiAgICByZXR1cm4gcmVzdWx0LkF0dHJpYnV0ZXMgYXMgQm94O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIGJveDonLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHVwZGF0ZUJveDsgIl19