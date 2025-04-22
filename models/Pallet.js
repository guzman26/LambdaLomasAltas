const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE = 'Pallets';
const MAX_BOXES_PER_PALLET = 60;

/**
 * Modelo para la entidad Pallet
 */
class Pallet {
  static getTableName() {
    return PALLETS_TABLE;
  }

  static getMaxBoxesPerPallet() {
    return MAX_BOXES_PER_PALLET;
  }

  /**
   * Validates a pallet id
   * @param {string} palletId - Pallet ID
   * @returns {boolean} Is valid
   */
  static isValidPalletId(palletId) {
    return palletId && typeof palletId === 'string';
  }
}

module.exports = Pallet; 