"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../../utils/response"));
/**
 * Generate a report with specific parameters
 */
const generateReport = async (params) => {
    console.log('Mock: Generating report with params', params);
    return (0, response_1.default)(200, 'Report generated successfully', {
        reportId: '123456',
        generatedAt: new Date().toISOString(),
        params
    });
};
/**
 * Generate an Excel report
 */
const generateExcelReport = async (params) => {
    console.log('Mock: Generating Excel report with params', params);
    return (0, response_1.default)(200, 'Excel report generated successfully', {
        reportId: '123456',
        format: 'excel',
        generatedAt: new Date().toISOString(),
        params
    });
};
/**
 * Generate a custom report
 */
const generateCustomReport = async (params) => {
    console.log('Mock: Generating custom report with params', params);
    return (0, response_1.default)(200, 'Custom report generated successfully', {
        reportId: '123456',
        type: 'custom',
        generatedAt: new Date().toISOString(),
        params
    });
};
exports.default = {
    generateReport,
    generateExcelReport,
    generateCustomReport
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9jb250cm9sbGVycy9yZXBvcnRzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0Esb0VBQXFEO0FBRXJEOztHQUVHO0FBQ0gsTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLE1BQTJCLEVBQXdCLEVBQUU7SUFDakYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzRCxPQUFPLElBQUEsa0JBQWlCLEVBQUMsR0FBRyxFQUFFLCtCQUErQixFQUFFO1FBQzdELFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFdBQVcsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtRQUNyQyxNQUFNO0tBQ1AsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUY7O0dBRUc7QUFDSCxNQUFNLG1CQUFtQixHQUFHLEtBQUssRUFBRSxNQUEyQixFQUF3QixFQUFFO0lBQ3RGLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTJDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDakUsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxxQ0FBcUMsRUFBRTtRQUNuRSxRQUFRLEVBQUUsUUFBUTtRQUNsQixNQUFNLEVBQUUsT0FBTztRQUNmLFdBQVcsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtRQUNyQyxNQUFNO0tBQ1AsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUY7O0dBRUc7QUFDSCxNQUFNLG9CQUFvQixHQUFHLEtBQUssRUFBRSxNQUEyQixFQUF3QixFQUFFO0lBQ3ZGLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbEUsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxzQ0FBc0MsRUFBRTtRQUNwRSxRQUFRLEVBQUUsUUFBUTtRQUNsQixJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtRQUNyQyxNQUFNO0tBQ1AsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsa0JBQWU7SUFDYixjQUFjO0lBQ2QsbUJBQW1CO0lBQ25CLG9CQUFvQjtDQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBpUmVzcG9uc2UgfSBmcm9tICcuLi8uLi90eXBlcyc7XG5pbXBvcnQgY3JlYXRlQXBpUmVzcG9uc2UgZnJvbSAnLi4vLi4vdXRpbHMvcmVzcG9uc2UnO1xuXG4vKipcbiAqIEdlbmVyYXRlIGEgcmVwb3J0IHdpdGggc3BlY2lmaWMgcGFyYW1ldGVyc1xuICovXG5jb25zdCBnZW5lcmF0ZVJlcG9ydCA9IGFzeW5jIChwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPEFwaVJlc3BvbnNlPiA9PiB7XG4gIGNvbnNvbGUubG9nKCdNb2NrOiBHZW5lcmF0aW5nIHJlcG9ydCB3aXRoIHBhcmFtcycsIHBhcmFtcyk7XG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsICdSZXBvcnQgZ2VuZXJhdGVkIHN1Y2Nlc3NmdWxseScsIHsgXG4gICAgcmVwb3J0SWQ6ICcxMjM0NTYnLFxuICAgIGdlbmVyYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgcGFyYW1zXG4gIH0pO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhbiBFeGNlbCByZXBvcnRcbiAqL1xuY29uc3QgZ2VuZXJhdGVFeGNlbFJlcG9ydCA9IGFzeW5jIChwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPEFwaVJlc3BvbnNlPiA9PiB7XG4gIGNvbnNvbGUubG9nKCdNb2NrOiBHZW5lcmF0aW5nIEV4Y2VsIHJlcG9ydCB3aXRoIHBhcmFtcycsIHBhcmFtcyk7XG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsICdFeGNlbCByZXBvcnQgZ2VuZXJhdGVkIHN1Y2Nlc3NmdWxseScsIHsgXG4gICAgcmVwb3J0SWQ6ICcxMjM0NTYnLFxuICAgIGZvcm1hdDogJ2V4Y2VsJyxcbiAgICBnZW5lcmF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHBhcmFtc1xuICB9KTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGUgYSBjdXN0b20gcmVwb3J0XG4gKi9cbmNvbnN0IGdlbmVyYXRlQ3VzdG9tUmVwb3J0ID0gYXN5bmMgKHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pik6IFByb21pc2U8QXBpUmVzcG9uc2U+ID0+IHtcbiAgY29uc29sZS5sb2coJ01vY2s6IEdlbmVyYXRpbmcgY3VzdG9tIHJlcG9ydCB3aXRoIHBhcmFtcycsIHBhcmFtcyk7XG4gIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsICdDdXN0b20gcmVwb3J0IGdlbmVyYXRlZCBzdWNjZXNzZnVsbHknLCB7IFxuICAgIHJlcG9ydElkOiAnMTIzNDU2JyxcbiAgICB0eXBlOiAnY3VzdG9tJyxcbiAgICBnZW5lcmF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHBhcmFtc1xuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZ2VuZXJhdGVSZXBvcnQsXG4gIGdlbmVyYXRlRXhjZWxSZXBvcnQsXG4gIGdlbmVyYXRlQ3VzdG9tUmVwb3J0XG59OyAiXX0=