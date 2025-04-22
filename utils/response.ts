import { ApiResponse } from '../types';

/**
 * Creates a standardized API response
 * @param statusCode - HTTP status code
 * @param message - Response message
 * @param data - Response data
 * @returns API response object
 */
function createApiResponse(
  statusCode: number, 
  message: string, 
  data: any = null
): ApiResponse {
  const response: ApiResponse = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    },
    body: JSON.stringify({
      status: statusCode < 400 ? 'success' : 'error',
      message,
      data
    })
  };
  return response;
}

export default createApiResponse; 