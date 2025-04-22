const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const BOX_REGEX = /^[0-9]{15}$/;

/**
 * Modelo para la entidad Caja (Box)
 */
class Box {
  /**
   * Validates a box code
   * @param {string} code - Box code
   * @returns {boolean} Is valid
   */
  static isValidBoxCode(code) {
    return BOX_REGEX.test(code);
  }

  /**
   * Extracts the fecha-calibre-formato from a box code
   * @param {string} boxCode - Complete box code
   * @returns {string} 9-digit FCF code
   */
  static extractFCF(boxCode) {
    if (!this.isValidBoxCode(boxCode)) {
      throw new Error(`Invalid box code: ${boxCode}`);
    }
    return boxCode.slice(0, 9);
  }
}

module.exports = Box; 