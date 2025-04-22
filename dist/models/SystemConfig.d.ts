import { Location, ItemType } from '../types';
/**
 * Modelo para la configuración del sistema
 */
declare class SystemConfig {
    static getConfigTable(): string;
    static getAdminLogsTable(): string;
    static getLocations(): Record<string, Location>;
    static getItemTypes(): Record<string, ItemType>;
    static isValidLocation(location: string): boolean;
    static isValidItemType(type: string): boolean;
}
export default SystemConfig;
