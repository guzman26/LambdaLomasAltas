import { ApiResponse } from '../../types';
import createApiResponse from '../../utils/response';

/**
 * Generate a report with specific parameters
 */
const generateReport = async (params: Record<string, any>): Promise<ApiResponse> => {
  console.log('Mock: Generating report with params', params);
  return createApiResponse(200, 'Report generated successfully', { 
    reportId: '123456',
    generatedAt: new Date().toISOString(),
    params
  });
};

/**
 * Generate an Excel report
 */
const generateExcelReport = async (params: Record<string, any>): Promise<ApiResponse> => {
  console.log('Mock: Generating Excel report with params', params);
  return createApiResponse(200, 'Excel report generated successfully', { 
    reportId: '123456',
    format: 'excel',
    generatedAt: new Date().toISOString(),
    params
  });
};

/**
 * Generate a custom report
 */
const generateCustomReport = async (params: Record<string, any>): Promise<ApiResponse> => {
  console.log('Mock: Generating custom report with params', params);
  return createApiResponse(200, 'Custom report generated successfully', { 
    reportId: '123456',
    type: 'custom',
    generatedAt: new Date().toISOString(),
    params
  });
};

export default {
  generateReport,
  generateExcelReport,
  generateCustomReport
}; 