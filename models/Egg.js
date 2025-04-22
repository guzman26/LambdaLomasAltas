const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const EGG_TABLE = 'Huevos';

/**
 * Modelo para la entidad Huevo (Egg)
 */
class Egg {
  static getTableName() {
    return EGG_TABLE;
  }

  /**
   * Parses a fecha-calibre-formato string into its components
   * @param {string} fcf - 9-digit string representing date, caliber and format info
   * @returns {object} Parsed components
   */
  static parseFechaCalibreFormato(fcf) {
    if (typeof fcf !== "string" || fcf.length !== 9) {
      throw new Error(`Invalid string: expected 9 digits but received "${fcf}"`);
    }

    const dayStr = fcf.slice(0, 1);
    const weekStr = fcf.slice(1, 3);
    const yearStr = fcf.slice(3, 5);
    const horario = fcf.slice(5, 6);
    const calibre = fcf.slice(6, 8);
    const formato = fcf.slice(8, 9);

    const day = Number(dayStr);
    const week = Number(weekStr);
    const year = 2000 + Number(yearStr);

    return {
      raw: fcf,
      day,
      week,
      year,
      horario,
      calibre,
      formato
    };
  }
}

module.exports = Egg; 