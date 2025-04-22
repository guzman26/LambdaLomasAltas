"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIssueById = exports.getIssues = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const response_1 = __importDefault(require("../../utils/response"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const ISSUES_TABLE = "Issues";
/**
 * Get all issues with optional filtering
 */
const getIssues = async (params) => {
    try {
        console.log('Getting issues with params:', params);
        const { status, startDate, endDate } = params;
        let filterExpression = '';
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};
        // Build filter expressions based on params
        if (status) {
            filterExpression += filterExpression ? ' AND ' : '';
            filterExpression += '#estado = :estado';
            expressionAttributeValues[':estado'] = status;
            expressionAttributeNames['#estado'] = 'estado';
        }
        if (startDate) {
            filterExpression += filterExpression ? ' AND ' : '';
            filterExpression += 'timestamp >= :startDate';
            expressionAttributeValues[':startDate'] = startDate;
        }
        if (endDate) {
            filterExpression += filterExpression ? ' AND ' : '';
            filterExpression += 'timestamp <= :endDate';
            expressionAttributeValues[':endDate'] = endDate;
        }
        const scanParams = {
            TableName: ISSUES_TABLE
        };
        if (filterExpression) {
            scanParams.FilterExpression = filterExpression;
            scanParams.ExpressionAttributeValues = expressionAttributeValues;
            if (Object.keys(expressionAttributeNames).length > 0) {
                scanParams.ExpressionAttributeNames = expressionAttributeNames;
            }
        }
        const result = await dynamoDB.scan(scanParams).promise();
        return (0, response_1.default)(200, "Issues retrieved successfully", result.Items);
    }
    catch (error) {
        console.error("❌ Error getting issues:", error);
        return (0, response_1.default)(500, "❌ Error retrieving issues", error.message);
    }
};
exports.getIssues = getIssues;
/**
 * Get a specific issue by ID
 */
const getIssueById = async (issueId) => {
    try {
        const params = {
            TableName: ISSUES_TABLE,
            Key: {
                IssueNumber: issueId
            }
        };
        const result = await dynamoDB.get(params).promise();
        if (!result.Item) {
            return (0, response_1.default)(404, `Issue with ID ${issueId} not found`);
        }
        return (0, response_1.default)(200, "Issue retrieved successfully", result.Item);
    }
    catch (error) {
        console.error(`❌ Error getting issue ${issueId}:`, error);
        return (0, response_1.default)(500, "❌ Error retrieving issue", error.message);
    }
};
exports.getIssueById = getIssueById;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvbnRyb2xsZXJzL2lzc3Vlcy9yZWFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHNEQUEwQjtBQUUxQixvRUFBcUQ7QUFFckQsTUFBTSxRQUFRLEdBQUcsSUFBSSxpQkFBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNuRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUM7QUFROUI7O0dBRUc7QUFDSSxNQUFNLFNBQVMsR0FBRyxLQUFLLEVBQUUsTUFBdUIsRUFBd0IsRUFBRTtJQUMvRSxJQUFJLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25ELE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUU5QyxJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUMxQixNQUFNLHlCQUF5QixHQUF3QixFQUFFLENBQUM7UUFDMUQsTUFBTSx3QkFBd0IsR0FBMkIsRUFBRSxDQUFDO1FBRTVELDJDQUEyQztRQUMzQyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1gsZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3BELGdCQUFnQixJQUFJLG1CQUFtQixDQUFDO1lBQ3hDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztZQUM5Qyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDakQsQ0FBQztRQUVELElBQUksU0FBUyxFQUFFLENBQUM7WUFDZCxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDcEQsZ0JBQWdCLElBQUkseUJBQXlCLENBQUM7WUFDOUMseUJBQXlCLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDO1FBQ3RELENBQUM7UUFFRCxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1osZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3BELGdCQUFnQixJQUFJLHVCQUF1QixDQUFDO1lBQzVDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUNsRCxDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQTBDO1lBQ3hELFNBQVMsRUFBRSxZQUFZO1NBQ3hCLENBQUM7UUFFRixJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDckIsVUFBVSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1lBQy9DLFVBQVUsQ0FBQyx5QkFBeUIsR0FBRyx5QkFBeUIsQ0FBQztZQUVqRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JELFVBQVUsQ0FBQyx3QkFBd0IsR0FBRyx3QkFBd0IsQ0FBQztZQUNqRSxDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV6RCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLCtCQUErQixFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSwyQkFBMkIsRUFBRyxLQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkYsQ0FBQztBQUNILENBQUMsQ0FBQztBQWpEVyxRQUFBLFNBQVMsYUFpRHBCO0FBRUY7O0dBRUc7QUFDSSxNQUFNLFlBQVksR0FBRyxLQUFLLEVBQUUsT0FBZSxFQUF3QixFQUFFO0lBQzFFLElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHO1lBQ2IsU0FBUyxFQUFFLFlBQVk7WUFDdkIsR0FBRyxFQUFFO2dCQUNILFdBQVcsRUFBRSxPQUFPO2FBQ3JCO1NBQ0YsQ0FBQztRQUVGLE1BQU0sTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVwRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pCLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsaUJBQWlCLE9BQU8sWUFBWSxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVELE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsOEJBQThCLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsT0FBTyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUQsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSwwQkFBMEIsRUFBRyxLQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEYsQ0FBQztBQUNILENBQUMsQ0FBQztBQXBCVyxRQUFBLFlBQVksZ0JBb0J2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgeyBBcGlSZXNwb25zZSwgSXNzdWUsIElzc3VlU3RhdHVzIH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuaW1wb3J0IGNyZWF0ZUFwaVJlc3BvbnNlIGZyb20gJy4uLy4uL3V0aWxzL3Jlc3BvbnNlJztcblxuY29uc3QgZHluYW1vREIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5jb25zdCBJU1NVRVNfVEFCTEUgPSBcIklzc3Vlc1wiO1xuXG5pbnRlcmZhY2UgR2V0SXNzdWVzUGFyYW1zIHtcbiAgc3RhdHVzPzogSXNzdWVTdGF0dXM7XG4gIHN0YXJ0RGF0ZT86IHN0cmluZztcbiAgZW5kRGF0ZT86IHN0cmluZztcbn1cblxuLyoqXG4gKiBHZXQgYWxsIGlzc3VlcyB3aXRoIG9wdGlvbmFsIGZpbHRlcmluZ1xuICovXG5leHBvcnQgY29uc3QgZ2V0SXNzdWVzID0gYXN5bmMgKHBhcmFtczogR2V0SXNzdWVzUGFyYW1zKTogUHJvbWlzZTxBcGlSZXNwb25zZT4gPT4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdHZXR0aW5nIGlzc3VlcyB3aXRoIHBhcmFtczonLCBwYXJhbXMpO1xuICAgIGNvbnN0IHsgc3RhdHVzLCBzdGFydERhdGUsIGVuZERhdGUgfSA9IHBhcmFtcztcbiAgICBcbiAgICBsZXQgZmlsdGVyRXhwcmVzc2lvbiA9ICcnO1xuICAgIGNvbnN0IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBcbiAgICAvLyBCdWlsZCBmaWx0ZXIgZXhwcmVzc2lvbnMgYmFzZWQgb24gcGFyYW1zXG4gICAgaWYgKHN0YXR1cykge1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbiArPSBmaWx0ZXJFeHByZXNzaW9uID8gJyBBTkQgJyA6ICcnO1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbiArPSAnI2VzdGFkbyA9IDplc3RhZG8nO1xuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOmVzdGFkbyddID0gc3RhdHVzO1xuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzWycjZXN0YWRvJ10gPSAnZXN0YWRvJztcbiAgICB9XG4gICAgXG4gICAgaWYgKHN0YXJ0RGF0ZSkge1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbiArPSBmaWx0ZXJFeHByZXNzaW9uID8gJyBBTkQgJyA6ICcnO1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbiArPSAndGltZXN0YW1wID49IDpzdGFydERhdGUnO1xuICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOnN0YXJ0RGF0ZSddID0gc3RhcnREYXRlO1xuICAgIH1cbiAgICBcbiAgICBpZiAoZW5kRGF0ZSkge1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbiArPSBmaWx0ZXJFeHByZXNzaW9uID8gJyBBTkQgJyA6ICcnO1xuICAgICAgZmlsdGVyRXhwcmVzc2lvbiArPSAndGltZXN0YW1wIDw9IDplbmREYXRlJztcbiAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzplbmREYXRlJ10gPSBlbmREYXRlO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBzY2FuUGFyYW1zOiBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQuU2NhbklucHV0ID0ge1xuICAgICAgVGFibGVOYW1lOiBJU1NVRVNfVEFCTEVcbiAgICB9O1xuICAgIFxuICAgIGlmIChmaWx0ZXJFeHByZXNzaW9uKSB7XG4gICAgICBzY2FuUGFyYW1zLkZpbHRlckV4cHJlc3Npb24gPSBmaWx0ZXJFeHByZXNzaW9uO1xuICAgICAgc2NhblBhcmFtcy5FeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzID0gZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcztcbiAgICAgIFxuICAgICAgaWYgKE9iamVjdC5rZXlzKGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcykubGVuZ3RoID4gMCkge1xuICAgICAgICBzY2FuUGFyYW1zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyA9IGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcztcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZHluYW1vREIuc2NhbihzY2FuUGFyYW1zKS5wcm9taXNlKCk7XG4gICAgXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgXCJJc3N1ZXMgcmV0cmlldmVkIHN1Y2Nlc3NmdWxseVwiLCByZXN1bHQuSXRlbXMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCLinYwgRXJyb3IgZ2V0dGluZyBpc3N1ZXM6XCIsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBcIuKdjCBFcnJvciByZXRyaWV2aW5nIGlzc3Vlc1wiLCAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICB9XG59O1xuXG4vKipcbiAqIEdldCBhIHNwZWNpZmljIGlzc3VlIGJ5IElEXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRJc3N1ZUJ5SWQgPSBhc3luYyAoaXNzdWVJZDogc3RyaW5nKTogUHJvbWlzZTxBcGlSZXNwb25zZT4gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIFRhYmxlTmFtZTogSVNTVUVTX1RBQkxFLFxuICAgICAgS2V5OiB7XG4gICAgICAgIElzc3VlTnVtYmVyOiBpc3N1ZUlkXG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkeW5hbW9EQi5nZXQocGFyYW1zKS5wcm9taXNlKCk7XG4gICAgXG4gICAgaWYgKCFyZXN1bHQuSXRlbSkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwNCwgYElzc3VlIHdpdGggSUQgJHtpc3N1ZUlkfSBub3QgZm91bmRgKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgXCJJc3N1ZSByZXRyaWV2ZWQgc3VjY2Vzc2Z1bGx5XCIsIHJlc3VsdC5JdGVtKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgZ2V0dGluZyBpc3N1ZSAke2lzc3VlSWR9OmAsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBcIuKdjCBFcnJvciByZXRyaWV2aW5nIGlzc3VlXCIsIChlcnJvciBhcyBFcnJvcikubWVzc2FnZSk7XG4gIH1cbn07ICJdfQ==