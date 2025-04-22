import { ApiResponse } from '../../types';
/**
 * Get system configuration
 * @param {string} configKey - Configuration key
 * @returns {Promise<any | null>} Configuration value, or null if not found
 */
export declare function getSystemConfig(configKey: string): Promise<any | null>;
/**
 * Set system configuration
 * @param {string} configKey - Configuration key
 * @param {any | null} configValue - Configuration value (use null to effectively remove/unset if your logic supports it)
 * @returns {Promise<{ configKey: string, configValue: any | null }>} Result
 */
export declare function setSystemConfig(configKey: string, configValue: any | null): Promise<{
    configKey: string;
    configValue: any | null;
}>;
/**
 * Revisa y corrige inconsistencias en los datos
 * @returns {Promise<ApiResponse>} API response with audit results
 */
export declare function auditAndFixData(): Promise<ApiResponse>;
/**
 * Respalda los datos de la aplicación
 * @returns {Promise<ApiResponse>} API response with backup results
 */
export declare function backupData(): Promise<ApiResponse>;
