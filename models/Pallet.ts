import AWS from 'aws-sdk';
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE = 'Pallets';
const MAX_BOXES_PER_PALLET = 60;

/**
 * Modelo para la entidad Pallet
 */
class Pallet {
  static getTableName(): string {
    return PALLETS_TABLE;
  }

  static getMaxBoxesPerPallet(): number {
    return MAX_BOXES_PER_PALLET;
  }

  /**
   * Validates a pallet id
   * @param palletId - Pallet ID
   * @returns Is valid
   */
  static isValidPalletId(palletId: unknown): boolean {
    return !!palletId && typeof palletId === 'string';
  }
}

export default Pallet; 