import AWS from 'aws-sdk';
import { ApiResponse, IssueStatus } from '../../types';
import createApiResponse from '../../utils/response';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ISSUES_TABLE = "Issues";

/**
 * Update an issue's status
 */
export const updateIssueStatus = async (
  issueId: string, 
  status: IssueStatus, 
  resolution?: string
): Promise<ApiResponse> => {
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
      return createApiResponse(404, `Issue with ID ${issueId} not found`);
    }
    
    // Build the update parameters
    const updateExpressions: string[] = [
      '#estado = :estado',
      'updatedAt = :updatedAt'
    ];
    
    const expressionAttributeValues: Record<string, any> = {
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
    
    return createApiResponse(200, `Issue status updated to ${status}`, result.Attributes);
  } catch (error) {
    console.error(`❌ Error updating issue ${issueId}:`, error);
    return createApiResponse(500, "❌ Error updating issue", (error as Error).message);
  }
}; 