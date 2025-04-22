"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIssueStatus = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const response_1 = __importDefault(require("../../utils/response"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const ISSUES_TABLE = "Issues";
/**
 * Update an issue's status
 */
const updateIssueStatus = async (issueId, status, resolution) => {
    try {
        console.log(`Updating issue ${issueId} status to ${status}`);
        // Validate that the issue exists
        const getParams = {
            TableName: ISSUES_TABLE,
            Key: {
                IssueNumber: issueId
            }
        };
        const issueResult = await dynamoDB.get(getParams).promise();
        if (!issueResult.Item) {
            return (0, response_1.default)(404, `Issue with ID ${issueId} not found`);
        }
        // Build the update parameters
        const updateExpressions = [
            '#estado = :estado',
            'updatedAt = :updatedAt'
        ];
        const expressionAttributeValues = {
            ':estado': status,
            ':updatedAt': new Date().toISOString()
        };
        // Add resolution if provided
        if (resolution) {
            updateExpressions.push('resolucion = :resolucion');
            expressionAttributeValues[':resolucion'] = resolution;
        }
        // If the status is RESOLVED, add resolution date
        if (status === 'RESOLVED') {
            updateExpressions.push('fechaResolucion = :fechaResolucion');
            expressionAttributeValues[':fechaResolucion'] = new Date().toISOString();
        }
        const params = {
            TableName: ISSUES_TABLE,
            Key: {
                IssueNumber: issueId
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: {
                '#estado': 'estado'
            },
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };
        const result = await dynamoDB.update(params).promise();
        return (0, response_1.default)(200, `Issue status updated to ${status}`, result.Attributes);
    }
    catch (error) {
        console.error(`❌ Error updating issue ${issueId}:`, error);
        return (0, response_1.default)(500, "❌ Error updating issue", error.message);
    }
};
exports.updateIssueStatus = updateIssueStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvaXNzdWVzL3VwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxzREFBMEI7QUFFMUIsb0VBQXFEO0FBRXJELE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDO0FBRTlCOztHQUVHO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQ3BDLE9BQWUsRUFDZixNQUFtQixFQUNuQixVQUFtQixFQUNHLEVBQUU7SUFDeEIsSUFBSSxDQUFDO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsT0FBTyxjQUFjLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFN0QsaUNBQWlDO1FBQ2pDLE1BQU0sU0FBUyxHQUFHO1lBQ2hCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLEdBQUcsRUFBRTtnQkFDSCxXQUFXLEVBQUUsT0FBTzthQUNyQjtTQUNGLENBQUM7UUFFRixNQUFNLFdBQVcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFNUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QixPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLGlCQUFpQixPQUFPLFlBQVksQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCw4QkFBOEI7UUFDOUIsTUFBTSxpQkFBaUIsR0FBYTtZQUNsQyxtQkFBbUI7WUFDbkIsd0JBQXdCO1NBQ3pCLENBQUM7UUFFRixNQUFNLHlCQUF5QixHQUF3QjtZQUNyRCxTQUFTLEVBQUUsTUFBTTtZQUNqQixZQUFZLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDdkMsQ0FBQztRQUVGLDZCQUE2QjtRQUM3QixJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2YsaUJBQWlCLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDbkQseUJBQXlCLENBQUMsYUFBYSxDQUFDLEdBQUcsVUFBVSxDQUFDO1FBQ3hELENBQUM7UUFFRCxpREFBaUQ7UUFDakQsSUFBSSxNQUFNLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDMUIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLENBQUM7WUFDN0QseUJBQXlCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNFLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRztZQUNiLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLEdBQUcsRUFBRTtnQkFDSCxXQUFXLEVBQUUsT0FBTzthQUNyQjtZQUNELGdCQUFnQixFQUFFLE9BQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZELHdCQUF3QixFQUFFO2dCQUN4QixTQUFTLEVBQUUsUUFBUTthQUNwQjtZQUNELHlCQUF5QixFQUFFLHlCQUF5QjtZQUNwRCxZQUFZLEVBQUUsU0FBUztTQUN4QixDQUFDO1FBRUYsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRXZELE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsMkJBQTJCLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLE9BQU8sR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNELE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsd0JBQXdCLEVBQUcsS0FBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BGLENBQUM7QUFDSCxDQUFDLENBQUM7QUFqRVcsUUFBQSxpQkFBaUIscUJBaUU1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgeyBBcGlSZXNwb25zZSwgSXNzdWVTdGF0dXMgfSBmcm9tICcuLi8uLi90eXBlcyc7XG5pbXBvcnQgY3JlYXRlQXBpUmVzcG9uc2UgZnJvbSAnLi4vLi4vdXRpbHMvcmVzcG9uc2UnO1xuXG5jb25zdCBkeW5hbW9EQiA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcbmNvbnN0IElTU1VFU19UQUJMRSA9IFwiSXNzdWVzXCI7XG5cbi8qKlxuICogVXBkYXRlIGFuIGlzc3VlJ3Mgc3RhdHVzXG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVJc3N1ZVN0YXR1cyA9IGFzeW5jIChcbiAgaXNzdWVJZDogc3RyaW5nLCBcbiAgc3RhdHVzOiBJc3N1ZVN0YXR1cywgXG4gIHJlc29sdXRpb24/OiBzdHJpbmdcbik6IFByb21pc2U8QXBpUmVzcG9uc2U+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhgVXBkYXRpbmcgaXNzdWUgJHtpc3N1ZUlkfSBzdGF0dXMgdG8gJHtzdGF0dXN9YCk7XG4gICAgXG4gICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgaXNzdWUgZXhpc3RzXG4gICAgY29uc3QgZ2V0UGFyYW1zID0ge1xuICAgICAgVGFibGVOYW1lOiBJU1NVRVNfVEFCTEUsXG4gICAgICBLZXk6IHtcbiAgICAgICAgSXNzdWVOdW1iZXI6IGlzc3VlSWRcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIGNvbnN0IGlzc3VlUmVzdWx0ID0gYXdhaXQgZHluYW1vREIuZ2V0KGdldFBhcmFtcykucHJvbWlzZSgpO1xuICAgIFxuICAgIGlmICghaXNzdWVSZXN1bHQuSXRlbSkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwNCwgYElzc3VlIHdpdGggSUQgJHtpc3N1ZUlkfSBub3QgZm91bmRgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gQnVpbGQgdGhlIHVwZGF0ZSBwYXJhbWV0ZXJzXG4gICAgY29uc3QgdXBkYXRlRXhwcmVzc2lvbnM6IHN0cmluZ1tdID0gW1xuICAgICAgJyNlc3RhZG8gPSA6ZXN0YWRvJyxcbiAgICAgICd1cGRhdGVkQXQgPSA6dXBkYXRlZEF0J1xuICAgIF07XG4gICAgXG4gICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcbiAgICAgICc6ZXN0YWRvJzogc3RhdHVzLFxuICAgICAgJzp1cGRhdGVkQXQnOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICB9O1xuICAgIFxuICAgIC8vIEFkZCByZXNvbHV0aW9uIGlmIHByb3ZpZGVkXG4gICAgaWYgKHJlc29sdXRpb24pIHtcbiAgICAgIHVwZGF0ZUV4cHJlc3Npb25zLnB1c2goJ3Jlc29sdWNpb24gPSA6cmVzb2x1Y2lvbicpO1xuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOnJlc29sdWNpb24nXSA9IHJlc29sdXRpb247XG4gICAgfVxuICAgIFxuICAgIC8vIElmIHRoZSBzdGF0dXMgaXMgUkVTT0xWRUQsIGFkZCByZXNvbHV0aW9uIGRhdGVcbiAgICBpZiAoc3RhdHVzID09PSAnUkVTT0xWRUQnKSB7XG4gICAgICB1cGRhdGVFeHByZXNzaW9ucy5wdXNoKCdmZWNoYVJlc29sdWNpb24gPSA6ZmVjaGFSZXNvbHVjaW9uJyk7XG4gICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6ZmVjaGFSZXNvbHVjaW9uJ10gPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIFRhYmxlTmFtZTogSVNTVUVTX1RBQkxFLFxuICAgICAgS2V5OiB7XG4gICAgICAgIElzc3VlTnVtYmVyOiBpc3N1ZUlkXG4gICAgICB9LFxuICAgICAgVXBkYXRlRXhwcmVzc2lvbjogYFNFVCAke3VwZGF0ZUV4cHJlc3Npb25zLmpvaW4oJywgJyl9YCxcbiAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAnI2VzdGFkbyc6ICdlc3RhZG8nXG4gICAgICB9LFxuICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICAgIFJldHVyblZhbHVlczogJ0FMTF9ORVcnXG4gICAgfTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkeW5hbW9EQi51cGRhdGUocGFyYW1zKS5wcm9taXNlKCk7XG4gICAgXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgYElzc3VlIHN0YXR1cyB1cGRhdGVkIHRvICR7c3RhdHVzfWAsIHJlc3VsdC5BdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgdXBkYXRpbmcgaXNzdWUgJHtpc3N1ZUlkfTpgLCBlcnJvcik7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgXCLinYwgRXJyb3IgdXBkYXRpbmcgaXNzdWVcIiwgKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlKTtcbiAgfVxufTsgIl19