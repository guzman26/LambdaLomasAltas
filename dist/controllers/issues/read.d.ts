import { ApiResponse, IssueStatus } from '../../types';
interface GetIssuesParams {
    status?: IssueStatus;
    startDate?: string;
    endDate?: string;
}
/**
 * Get all issues with optional filtering
 */
export declare const getIssues: (params: GetIssuesParams) => Promise<ApiResponse>;
/**
 * Get a specific issue by ID
 */
export declare const getIssueById: (issueId: string) => Promise<ApiResponse>;
export {};
