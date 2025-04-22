"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const EGG_TABLE = process.env.HUEVOS_TABLE || "Huevos";
const PALLETS_TABLE = process.env.PALLETS_TABLE || "Pallets";
/**
 * Utility functions for database operations
 */
const dbUtils = {
    /**
     * Generic function to get an item by its key from a table
     */
    async getItem(tableName, key) {
        try {
            const params = {
                TableName: tableName,
                Key: key
            };
            const result = await dynamoDB.get(params).promise();
            return result.Item || undefined;
        }
        catch (error) {
            console.error(`❌ Error getting item from ${tableName}:`, error);
            throw new Error(`Error getting item from ${tableName}`);
        }
    },
    /**
     * Generic function to put an item in a table
     */
    async putItem(tableName, item) {
        try {
            const params = {
                TableName: tableName,
                Item: item
            };
            return await dynamoDB.put(params).promise();
        }
        catch (error) {
            console.error(`❌ Error putting item in ${tableName}:`, error);
            throw new Error(`Error putting item in ${tableName}`);
        }
    },
    /**
     * Generic function to update an item in a table
     */
    async updateItem(tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames = null) {
        try {
            const params = {
                TableName: tableName,
                Key: key,
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: "ALL_NEW"
            };
            if (expressionAttributeNames) {
                params.ExpressionAttributeNames = expressionAttributeNames;
            }
            const result = await dynamoDB.update(params).promise();
            return result.Attributes;
        }
        catch (error) {
            console.error(`❌ Error updating item in ${tableName}:`, error);
            throw new Error(`Error updating item in ${tableName}`);
        }
    },
    /**
     * Generic function to delete an item from a table
     */
    async deleteItem(tableName, key) {
        try {
            const params = {
                TableName: tableName,
                Key: key,
                ReturnValues: "ALL_OLD"
            };
            const result = await dynamoDB.delete(params).promise();
            return result.Attributes;
        }
        catch (error) {
            console.error(`❌ Error deleting item from ${tableName}:`, error);
            throw new Error(`Error deleting item from ${tableName}`);
        }
    },
    /**
     * Generic function to query items from a table
     */
    async queryItems(tableName, keyConditionExpression, expressionAttributeValues, expressionAttributeNames = null, indexName = null) {
        try {
            const params = {
                TableName: tableName,
                KeyConditionExpression: keyConditionExpression,
                ExpressionAttributeValues: expressionAttributeValues
            };
            if (expressionAttributeNames) {
                params.ExpressionAttributeNames = expressionAttributeNames;
            }
            if (indexName) {
                params.IndexName = indexName;
            }
            const result = await dynamoDB.query(params).promise();
            return result.Items || [];
        }
        catch (error) {
            console.error(`❌ Error querying items from ${tableName}:`, error);
            throw new Error(`Error querying items from ${tableName}`);
        }
    },
    /**
     * Generic function to scan items from a table
     */
    async scanItems(tableName, filterExpression = null, expressionAttributeValues = null, expressionAttributeNames = null) {
        try {
            const params = {
                TableName: tableName
            };
            if (filterExpression) {
                params.FilterExpression = filterExpression;
            }
            if (expressionAttributeValues) {
                params.ExpressionAttributeValues = expressionAttributeValues;
            }
            if (expressionAttributeNames) {
                params.ExpressionAttributeNames = expressionAttributeNames;
            }
            const result = await dynamoDB.scan(params).promise();
            return result.Items || [];
        }
        catch (error) {
            console.error(`❌ Error scanning items from ${tableName}:`, error);
            throw new Error(`Error scanning items from ${tableName}`);
        }
    }
};
exports.default = {
    getItem: dbUtils.getItem,
    putItem: dbUtils.putItem,
    updateItem: dbUtils.updateItem,
    deleteItem: dbUtils.deleteItem,
    queryItems: dbUtils.queryItems,
    scanItems: dbUtils.scanItems
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi91dGlscy9kYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUEwQjtBQUcxQixNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ25ELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLFFBQVEsQ0FBQztBQUN2RCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTLENBQUM7QUFFN0Q7O0dBRUc7QUFDSCxNQUFNLE9BQU8sR0FBRztJQUNkOztPQUVHO0lBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpQixFQUFFLEdBQXdCO1FBQ3ZELElBQUksQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHO2dCQUNiLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixHQUFHLEVBQUUsR0FBRzthQUNULENBQUM7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEQsT0FBTyxNQUFNLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQztRQUNsQyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLFNBQVMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDMUQsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBaUIsRUFBRSxJQUFrQjtRQUNqRCxJQUFJLENBQUM7WUFDSCxNQUFNLE1BQU0sR0FBRztnQkFDYixTQUFTLEVBQUUsU0FBUztnQkFDcEIsSUFBSSxFQUFFLElBQUk7YUFDWCxD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LENBQUMsT0FBTztJQUN4QixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87SUFDeEIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVO0lBQzlCLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTtJQUM5QixVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7SUFDOUIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO0NBQzdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHsgRHluYW1vRGJJdGVtIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5jb25zdCBkeW5hbW9EQiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcbmNvbnN0IEVHR19UQUJMRSA9IHByb2Nlc3MuZW52LkhVRVZPU19UQUJMRSB8fCBcIkh1ZXZvc1wiO1xuY29uc3QgUEFMTEVUU19UQUJMRSA9IHByb2Nlc3MuZW52LlBBTExFVFNfVEFCTEUgfHwgXCJQYWxsZXRzXCI7XG5cbi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbnMgZm9yIGRhdGFiYXNlIG9wZXJhdGlvbnNcbiAqL1xuY29uc3QgZGJVdGlscyA9IHtcbiAgLyoqXG4gICAqIEdlbmVyaWMgZnVuY3Rpb24gdG8gZ2V0IGFuIGl0ZW0gYnkgaXRzIGtleSBmcm9tIGEgdGFibGVcbiAgICovXG4gIGFzeW5jIGdldEl0ZW0odGFibGVOYW1lOiBzdHJpbmcsIGtleTogUmVjb3JkPHN0cmluZywgYW55Pik6IFByb21pc2U8RHluYW1vRGJJdGVtIHwgdW5kZWZpbmVkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgVGFibGVOYW1lOiB0YWJsZU5hbWUsXG4gICAgICAgIEtleToga2V5XG4gICAgICB9O1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZHluYW1vREIuZ2V0KHBhcmFtcykucHJvbWlzZSgpO1xuICAgICAgcmV0dXJuIHJlc3VsdC5JdGVtIHx8IHVuZGVmaW5lZDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yIGdldHRpbmcgaXRlbSBmcm9tICR7dGFibGVOYW1lfTpgLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGdldHRpbmcgaXRlbSBmcm9tICR7dGFibGVOYW1lfWApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogR2VuZXJpYyBmdW5jdGlvbiB0byBwdXQgYW4gaXRlbSBpbiBhIHRhYmxlXG4gICAqL1xuICBhc3luYyBwdXRJdGVtKHRhYmxlTmFtZTogc3RyaW5nLCBpdGVtOiBEeW5hbW9EYkl0ZW0pOiBQcm9taXNlPEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudC5QdXRJdGVtT3V0cHV0PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgVGFibGVOYW1lOiB0YWJsZU5hbWUsXG4gICAgICAgIEl0ZW06IGl0ZW1cbiAgICAgIH07XG4gICAgICByZXR1cm4gYXdhaXQgZHluYW1vREIucHV0KHBhcmFtcykucHJvbWlzZSgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgcHV0dGluZyBpdGVtIGluICR7dGFibGVOYW1lfTpgLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHB1dHRpbmcgaXRlbSBpbiAke3RhYmxlTmFtZX1gKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdlbmVyaWMgZnVuY3Rpb24gdG8gdXBkYXRlIGFuIGl0ZW0gaW4gYSB0YWJsZVxuICAgKi9cbiAgYXN5bmMgdXBkYXRlSXRlbShcbiAgICB0YWJsZU5hbWU6IHN0cmluZywgXG4gICAga2V5OiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBcbiAgICB1cGRhdGVFeHByZXNzaW9uOiBzdHJpbmcsIFxuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4sIFxuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IG51bGwgPSBudWxsXG4gICk6IFByb21pc2U8RHluYW1vRGJJdGVtPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcmFtczogQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50LlVwZGF0ZUl0ZW1JbnB1dCA9IHtcbiAgICAgICAgVGFibGVOYW1lOiB0YWJsZU5hbWUsXG4gICAgICAgIEtleToga2V5LFxuICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiB1cGRhdGVFeHByZXNzaW9uLFxuICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzLFxuICAgICAgICBSZXR1cm5WYWx1ZXM6IFwiQUxMX05FV1wiXG4gICAgICB9O1xuXG4gICAgICBpZiAoZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzKSB7XG4gICAgICAgIHBhcmFtcy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMgPSBleHByZXNzaW9uQXR0cmlidXRlTmFtZXM7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLnVwZGF0ZShwYXJhbXMpLnByb21pc2UoKTtcbiAgICAgIHJldHVybiByZXN1bHQuQXR0cmlidXRlcyBhcyBEeW5hbW9EYkl0ZW07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciB1cGRhdGluZyBpdGVtIGluICR7dGFibGVOYW1lfTpgLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHVwZGF0aW5nIGl0ZW0gaW4gJHt0YWJsZU5hbWV9YCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBHZW5lcmljIGZ1bmN0aW9uIHRvIGRlbGV0ZSBhbiBpdGVtIGZyb20gYSB0YWJsZVxuICAgKi9cbiAgYXN5bmMgZGVsZXRlSXRlbSh0YWJsZU5hbWU6IHN0cmluZywga2V5OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxEeW5hbW9EYkl0ZW0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICBUYWJsZU5hbWU6IHRhYmxlTmFtZSxcbiAgICAgICAgS2V5OiBrZXksXG4gICAgICAgIFJldHVyblZhbHVlczogXCJBTExfT0xEXCJcbiAgICAgIH07XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkeW5hbW9EQi5kZWxldGUocGFyYW1zKS5wcm9taXNlKCk7XG4gICAgICByZXR1cm4gcmVzdWx0LkF0dHJpYnV0ZXMgYXMgRHluYW1vRGJJdGVtO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgZGVsZXRpbmcgaXRlbSBmcm9tICR7dGFibGVOYW1lfTpgLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGRlbGV0aW5nIGl0ZW0gZnJvbSAke3RhYmxlTmFtZX1gKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdlbmVyaWMgZnVuY3Rpb24gdG8gcXVlcnkgaXRlbXMgZnJvbSBhIHRhYmxlXG4gICAqL1xuICBhc3luYyBxdWVyeUl0ZW1zKFxuICAgIHRhYmxlTmFtZTogc3RyaW5nLCBcbiAgICBrZXlDb25kaXRpb25FeHByZXNzaW9uOiBzdHJpbmcsIFxuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4sIFxuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IG51bGwgPSBudWxsLCBcbiAgICBpbmRleE5hbWU6IHN0cmluZyB8IG51bGwgPSBudWxsXG4gICk6IFByb21pc2U8RHluYW1vRGJJdGVtW10+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyYW1zOiBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQuUXVlcnlJbnB1dCA9IHtcbiAgICAgICAgVGFibGVOYW1lOiB0YWJsZU5hbWUsXG4gICAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246IGtleUNvbmRpdGlvbkV4cHJlc3Npb24sXG4gICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNcbiAgICAgIH07XG5cbiAgICAgIGlmIChleHByZXNzaW9uQXR0cmlidXRlTmFtZXMpIHtcbiAgICAgICAgcGFyYW1zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyA9IGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcztcbiAgICAgIH1cblxuICAgICAgaWYgKGluZGV4TmFtZSkge1xuICAgICAgICBwYXJhbXMuSW5kZXhOYW1lID0gaW5kZXhOYW1lO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkeW5hbW9EQi5xdWVyeShwYXJhbXMpLnByb21pc2UoKTtcbiAgICAgIHJldHVybiByZXN1bHQuSXRlbXMgfHwgW107XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciBxdWVyeWluZyBpdGVtcyBmcm9tICR7dGFibGVOYW1lfTpgLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHF1ZXJ5aW5nIGl0ZW1zIGZyb20gJHt0YWJsZU5hbWV9YCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBHZW5lcmljIGZ1bmN0aW9uIHRvIHNjYW4gaXRlbXMgZnJvbSBhIHRhYmxlXG4gICAqL1xuICBhc3luYyBzY2FuSXRlbXMoXG4gICAgdGFibGVOYW1lOiBzdHJpbmcsIFxuICAgIGZpbHRlckV4cHJlc3Npb246IHN0cmluZyB8IG51bGwgPSBudWxsLCBcbiAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCA9IG51bGwsIFxuICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IG51bGwgPSBudWxsXG4gICk6IFByb21pc2U8RHluYW1vRGJJdGVtW10+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyYW1zOiBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQuU2NhbklucHV0ID0ge1xuICAgICAgICBUYWJsZU5hbWU6IHRhYmxlTmFtZVxuICAgICAgfTtcblxuICAgICAgaWYgKGZpbHRlckV4cHJlc3Npb24pIHtcbiAgICAgICAgcGFyYW1zLkZpbHRlckV4cHJlc3Npb24gPSBmaWx0ZXJFeHByZXNzaW9uO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcykge1xuICAgICAgICBwYXJhbXMuRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyA9IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM7XG4gICAgICB9XG5cbiAgICAgIGlmIChleHByZXNzaW9uQXR0cmlidXRlTmFtZXMpIHtcbiAgICAgICAgcGFyYW1zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyA9IGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcztcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZHluYW1vREIuc2NhbihwYXJhbXMpLnByb21pc2UoKTtcbiAgICAgIHJldHVybiByZXN1bHQuSXRlbXMgfHwgW107XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciBzY2FubmluZyBpdGVtcyBmcm9tICR7dGFibGVOYW1lfTpgLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHNjYW5uaW5nIGl0ZW1zIGZyb20gJHt0YWJsZU5hbWV9YCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGdldEl0ZW06IGRiVXRpbHMuZ2V0SXRlbSxcbiAgcHV0SXRlbTogZGJVdGlscy5wdXRJdGVtLFxuICB1cGRhdGVJdGVtOiBkYlV0aWxzLnVwZGF0ZUl0ZW0sXG4gIGRlbGV0ZUl0ZW06IGRiVXRpbHMuZGVsZXRlSXRlbSxcbiAgcXVlcnlJdGVtczogZGJVdGlscy5xdWVyeUl0ZW1zLFxuICBzY2FuSXRlbXM6IGRiVXRpbHMuc2Nhbkl0ZW1zXG59OyAiXX0=