import { ApiResponse, IssueStatus } from '../../types';
export interface GetIssuesOptions {
    status?: IssueStatus;
    /** ISO‑8601 o timestamp que tu backend entienda               */
    startDate?: string;
    endDate?: string;
}
export interface UpdateIssueInput {
    issueId: string;
    status: IssueStatus;
    resolution?: string | null;
}
/**
 * Obtiene la lista de incidencias con filtros opcionales.
 */
export declare function getIssues(options?: GetIssuesOptions): Promise<ApiResponse>;
/**
 * Actualiza el estado de una incidencia.
 */
export declare function updateIssueStatus({ issueId, status, resolution, }: UpdateIssueInput): Promise<ApiResponse>;
/**
 * Elimina una incidencia.
 */
export declare function deleteIssue(issueId: string): Promise<ApiResponse>;
