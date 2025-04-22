const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const ISSUES_TABLE = 'Issues';

/**
 * Modelo para la entidad Incidencia (Issue)
 */
class Issue {
  static getTableName() {
    return ISSUES_TABLE;
  }
  
  static getStatusValues() {
    return ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
  }

  static isValidStatus(status) {
    return this.getStatusValues().includes(status);
  }
}

module.exports = Issue; 