import AWS from 'aws-sdk';
import { ApiResponse, Issue, IssueStatus } from '../../types';
import createApiResponse from '../../utils/response';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ISSUES_TABLE = "Issues";

interface GetIssuesParams {
  status?: IssueStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Get all issues with optional filtering
 */
export const getIssues = async (params: GetIssuesParams): Promise<ApiResponse> => {
  try {
    console.log('Getting issues with params:', params);
    const { status, startDate, endDate } = params;
    
    let filterExpression = '';
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};
    
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
    
    const scanParams: AWS.DynamoDB.DocumentClient.ScanInput = {
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
    
    return createApiResponse(200, "Issues retrieved successfully", result.Items);
  } catch (error) {
    console.error("❌ Error getting issues:", error);
    return createApiResponse(500, "❌ Error retrieving issues", (error as Error).message);
  }
};

/**
 * Get a specific issue by ID
 */
export const getIssueById = async (issueId: string): Promise<ApiResponse> => {
  try {
    const params = {
      TableName: ISSUES_TABLE,
      Key: {
        IssueNumber: issueId
      }
    };
    
    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return createApiResponse(404, `Issue with ID ${issueId} not found`);
    }
    
    return createApiResponse(200, "Issue retrieved successfully", result.Item);
  } catch (error) {
    console.error(`❌ Error getting issue ${issueId}:`, error);
    return createApiResponse(500, "❌ Error retrieving issue", (error as Error).message);
  }
}; 