import AWS from 'aws-sdk';
import { Location, ItemType } from '../types';

const CONFIG_TABLE = 'SystemConfig';
const ADMIN_LOGS_TABLE = 'AdminLogs';

const LOCATIONS: Record<string, Location> = {
  PACKING: "PACKING",
  BODEGA: "BODEGA",
  VENTA: "VENTA",
  TRANSITO: "TRANSITO",
};

const ITEM_TYPES: Record<string, ItemType> = {
  BOX: "BOX",
  PALLET: "PALLET",
};

/**
 * Modelo para la configuración del sistema
 */
class SystemConfig {
  static getConfigTable(): string {
    return CONFIG_TABLE;
  }

  static getAdminLogsTable(): string {
    return ADMIN_LOGS_TABLE;
  }

  static getLocations(): Record<string, Location> {
    return LOCATIONS;
  }

  static getItemTypes(): Record<string, ItemType> {
    return ITEM_TYPES;
  }

  static isValidLocation(location: string): boolean {
    return Object.values(LOCATIONS).includes(location as Location);
  }

  static isValidItemType(type: string): boolean {
    return Object.values(ITEM_TYPES).includes(type as ItemType);
  }
}

export default SystemConfig; 