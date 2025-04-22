const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const CONFIG_TABLE = 'SystemConfig';
const ADMIN_LOGS_TABLE = 'AdminLogs';
const LOCATIONS = {
  PACKING: "PACKING",
  BODEGA: "BODEGA",
  VENTA: "VENTA",
  TRANSITO: "TRANSITO",
};

const ITEM_TYPES = {
  BOX: "BOX",
  PALLET: "PALLET",
};

/**
 * Modelo para la configuración del sistema
 */
class SystemConfig {
  static getConfigTable() {
    return CONFIG_TABLE;
  }

  static getAdminLogsTable() {
    return ADMIN_LOGS_TABLE;
  }

  static getLocations() {
    return LOCATIONS;
  }

  static getItemTypes() {
    return ITEM_TYPES;
  }

  static isValidLocation(location) {
    return Object.values(LOCATIONS).includes(location);
  }

  static isValidItemType(type) {
    return Object.values(ITEM_TYPES).includes(type);
  }
}

module.exports = SystemConfig; 