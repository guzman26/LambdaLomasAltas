import { ApiResponse, IssueStatus } from '../../types';
/**
 * Update an issue's status
 */
export declare const updateIssueStatus: (issueId: string, status: IssueStatus, resolution?: string) => Promise<ApiResponse>;
