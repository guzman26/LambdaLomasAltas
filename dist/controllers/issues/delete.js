"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const response_1 = __importDefault(require("../../utils/response"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
const ISSUES_TABLE = "Issues";
/**
 * Delete an issue by ID
 */
const deleteIssue = async (issueId) => {
    try {
        console.log(`Deleting issue with ID ${issueId}`);
        // First, verify the issue exists
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
        // Delete the issue
        const deleteParams = {
            TableName: ISSUES_TABLE,
            Key: {
                IssueNumber: issueId
            },
            ReturnValues: 'ALL_OLD'
        };
        const result = await dynamoDB.delete(deleteParams).promise();
        // Log action for audit purposes
        console.log(`Issue ${issueId} deleted. Original data:`, result.Attributes);
        return (0, response_1.default)(200, `Issue ${issueId} deleted successfully`);
    }
    catch (error) {
        console.error(`❌ Error deleting issue ${issueId}:`, error);
        return (0, response_1.default)(500, "❌ Error deleting issue", error.message);
    }
};
exports.default = deleteIssue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvaXNzdWVzL2RlbGV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUEwQjtBQUUxQixvRUFBcUQ7QUFFckQsTUFBTSxRQUFRLEdBQUcsSUFBSSxpQkFBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNuRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUM7QUFFOUI7O0dBRUc7QUFDSCxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsT0FBZSxFQUF3QixFQUFFO0lBQ2xFLElBQUksQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFakQsaUNBQWlDO1FBQ2pDLE1BQU0sU0FBUyxHQUFHO1lBQ2hCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLEdBQUcsRUFBRTtnQkFDSCxXQUFXLEVBQUUsT0FBTzthQUNyQjtTQUNGLENBQUM7UUFFRixNQUFNLFdBQVcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFNUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QixPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLGlCQUFpQixPQUFPLFlBQVksQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxtQkFBbUI7UUFDbkIsTUFBTSxZQUFZLEdBQUc7WUFDbkIsU0FBUyxFQUFFLFlBQVk7WUFDdkIsR0FBRyxFQUFFO2dCQUNILFdBQVcsRUFBRSxPQUFPO2FBQ3JCO1lBQ0QsWUFBWSxFQUFFLFNBQVM7U0FDeEIsQ0FBQztRQUVGLE1BQU0sTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUU3RCxnQ0FBZ0M7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLE9BQU8sMEJBQTBCLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTNFLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsU0FBUyxPQUFPLHVCQUF1QixDQUFDLENBQUM7SUFDekUsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixPQUFPLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzRCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLHdCQUF3QixFQUFHLEtBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwRixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsa0JBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7IEFwaVJlc3BvbnNlIH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuaW1wb3J0IGNyZWF0ZUFwaVJlc3BvbnNlIGZyb20gJy4uLy4uL3V0aWxzL3Jlc3BvbnNlJztcblxuY29uc3QgZHluYW1vREIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5jb25zdCBJU1NVRVNfVEFCTEUgPSBcIklzc3Vlc1wiO1xuXG4vKipcbiAqIERlbGV0ZSBhbiBpc3N1ZSBieSBJRFxuICovXG5jb25zdCBkZWxldGVJc3N1ZSA9IGFzeW5jIChpc3N1ZUlkOiBzdHJpbmcpOiBQcm9taXNlPEFwaVJlc3BvbnNlPiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coYERlbGV0aW5nIGlzc3VlIHdpdGggSUQgJHtpc3N1ZUlkfWApO1xuICAgIFxuICAgIC8vIEZpcnN0LCB2ZXJpZnkgdGhlIGlzc3VlIGV4aXN0c1xuICAgIGNvbnN0IGdldFBhcmFtcyA9IHtcbiAgICAgIFRhYmxlTmFtZTogSVNTVUVTX1RBQkxFLFxuICAgICAgS2V5OiB7XG4gICAgICAgIElzc3VlTnVtYmVyOiBpc3N1ZUlkXG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBjb25zdCBpc3N1ZVJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLmdldChnZXRQYXJhbXMpLnByb21pc2UoKTtcbiAgICBcbiAgICBpZiAoIWlzc3VlUmVzdWx0Lkl0ZW0pIHtcbiAgICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg0MDQsIGBJc3N1ZSB3aXRoIElEICR7aXNzdWVJZH0gbm90IGZvdW5kYCk7XG4gICAgfVxuICAgIFxuICAgIC8vIERlbGV0ZSB0aGUgaXNzdWVcbiAgICBjb25zdCBkZWxldGVQYXJhbXMgPSB7XG4gICAgICBUYWJsZU5hbWU6IElTU1VFU19UQUJMRSxcbiAgICAgIEtleToge1xuICAgICAgICBJc3N1ZU51bWJlcjogaXNzdWVJZFxuICAgICAgfSxcbiAgICAgIFJldHVyblZhbHVlczogJ0FMTF9PTEQnXG4gICAgfTtcbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkeW5hbW9EQi5kZWxldGUoZGVsZXRlUGFyYW1zKS5wcm9taXNlKCk7XG4gICAgXG4gICAgLy8gTG9nIGFjdGlvbiBmb3IgYXVkaXQgcHVycG9zZXNcbiAgICBjb25zb2xlLmxvZyhgSXNzdWUgJHtpc3N1ZUlkfSBkZWxldGVkLiBPcmlnaW5hbCBkYXRhOmAsIHJlc3VsdC5BdHRyaWJ1dGVzKTtcbiAgICBcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoMjAwLCBgSXNzdWUgJHtpc3N1ZUlkfSBkZWxldGVkIHN1Y2Nlc3NmdWxseWApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciBkZWxldGluZyBpc3N1ZSAke2lzc3VlSWR9OmAsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBcIuKdjCBFcnJvciBkZWxldGluZyBpc3N1ZVwiLCAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWxldGVJc3N1ZTsgIl19