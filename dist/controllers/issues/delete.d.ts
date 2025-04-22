import { ApiResponse } from '../../types';
/**
 * Delete an issue by ID
 */
declare const deleteIssue: (issueId: string) => Promise<ApiResponse>;
export default deleteIssue;
