type IssueStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
/**
 * Modelo para la entidad Incidencia (Issue)
 */
declare class Issue {
    static getTableName(): string;
    static getStatusValues(): IssueStatus[];
    static isValidStatus(status: string): boolean;
}
export default Issue;
