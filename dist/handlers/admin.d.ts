interface Issue {
    IssueNumber: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | string;
    timestamp: string;
    lastUpdated?: string;
    resolution?: string;
}
interface GetIssuesOptions {
    status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | string;
    startDate?: string;
    endDate?: string;
}
interface SystemDashboard {
    stats: {
        huevos_en_packing: number;
        huevos_en_bodega: number;
        huevos_en_venta: number;
        total_pallets: number;
        issues_pendientes: number;
    };
    config: {
        pallet_activo: any;
    };
}
interface AuditResults {
    issues: {
        huevosSinPallets: string[];
        palletsInvalidos: string[];
        configsInvalidas: string[];
    };
    fixes: {
        huevosCorregidos: number;
        palletsCorregidos: number;
        configsCorregidas: number;
    };
}
interface BackupResult {
    table: string;
    records: number;
    path: string;
}
interface BackupInfo {
    status: string;
    timestamp: string;
    details: BackupResult[];
}
interface DeleteIssueResult {
    deleted: boolean;
    message: string;
}
/**
 * Obtiene un dashboard con métricas clave del sistema
 * @returns {Promise<SystemDashboard>} Dashboard con métricas del sistema
 */
export declare function getSystemDashboard(): Promise<SystemDashboard>;
/**
 * Obtiene la lista de problemas reportados con opciones de filtrado
 * @param {GetIssuesOptions} options - Opciones de filtrado (estado, fecha)
 * @returns {Promise<Issue[]>} Lista de problemas
 */
export declare function getIssues(options?: GetIssuesOptions): Promise<Issue[]>;
/**
 * Actualiza el estado de un problema reportado
 * @param {string} issueId - ID del problema
 * @param {'PENDING' | 'IN_PROGRESS' | 'RESOLVED'} status - Nuevo estado
 * @param {string | null} resolution - Comentario de resolución (opcional)
 * @returns {Promise<Issue | undefined>} Problema actualizado, or undefined if not found
 */
export declare function updateIssueStatus(issueId: string, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED', resolution?: string | null): Promise<Issue | undefined>;
/**
 * Revisa y corrige inconsistencias en los datos
 * @returns {Promise<AuditResults>} Resultado de la verificación
 */
export declare function auditAndFixData(): Promise<AuditResults>;
/**
 * Respalda los datos de la aplicación
 * @returns {Promise<BackupInfo>} Información sobre el respaldo
 */
export declare function backupData(): Promise<BackupInfo>;
/**
 * Elimina un issue de la base de datos
 * @param {string} issueId - ID del issue a eliminar
 * @returns {Promise<DeleteIssueResult>} Resultado de la operación
 */
export declare function deleteIssue(issueId: string): Promise<DeleteIssueResult>;
export {};
