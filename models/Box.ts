import AWS from 'aws-sdk';
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const BOX_REGEX = /^[0-9]{15}$/;

/**
 * Modelo para la entidad Caja (Box)
 */
class Box {
  /**
   * Validates a box code
   * @param code - Box code
   * @returns Is valid
   */
  static isValidBoxCode(code: string): boolean {
    return BOX_REGEX.test(code);
  }

  /**
   * Extracts the fecha-calibre-formato from a box code
   * @param boxCode - Complete box code
   * @returns 9-digit FCF code
   */
  static extractFCF(boxCode: string): string {
    if (!this.isValidBoxCode(boxCode)) {
      throw new Error(`Invalid box code: ${boxCode}`);
    }
    return boxCode.slice(0, 9);
  }

  /**
   * Returns the name of the DynamoDB table for boxes
   * @returns Table name
   */
  static getTableName(): string {
    return process.env.BOXES_TABLE_NAME || 'Boxes';
  }
}

export default Box; 