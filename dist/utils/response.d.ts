import { ApiResponse } from '../types';
/**
 * Creates a standardized API response
 * @param statusCode - HTTP status code
 * @param message - Response message
 * @param data - Response data
 * @returns API response object
 */
declare function createApiResponse(statusCode: number, message: string, data?: any): ApiResponse;
export default createApiResponse;
