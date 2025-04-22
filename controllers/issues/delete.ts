import AWS from 'aws-sdk';
import { ApiResponse } from '../../types';
import createApiResponse from '../../utils/response';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ISSUES_TABLE = "Issues";

/**
 * Delete an issue by ID
 */
const deleteIssue = async (issueId: string): Promise<ApiResponse> => {
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
      return createApiResponse(404, `Issue with ID ${issueId} not found`);
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
    
    return createApiResponse(200, `Issue ${issueId} deleted successfully`);
  } catch (error) {
    console.error(`❌ Error deleting issue ${issueId}:`, error);
    return createApiResponse(500, "❌ Error deleting issue", (error as Error).message);
  }
};

export default deleteIssue; 