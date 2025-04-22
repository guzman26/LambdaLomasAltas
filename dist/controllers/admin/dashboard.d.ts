import { ApiResponse } from '../../types';
/**
 * Obtiene un dashboard con métricas clave del sistema
 * @returns {Promise<ApiResponse>} API response with dashboard data
 */
export declare function getSystemDashboard(): Promise<ApiResponse>;
declare const _default: {
    getSystemDashboard: typeof getSystemDashboard;
};
export default _default;
