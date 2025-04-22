import AWS from 'aws-sdk';
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const ISSUES_TABLE = 'Issues';

type IssueStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

/**
 * Modelo para la entidad Incidencia (Issue)
 */
class Issue {
  static getTableName(): string {
    return ISSUES_TABLE;
  }
  
  static getStatusValues(): IssueStatus[] {
    return ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
  }

  static isValidStatus(status: string): boolean {
    return this.getStatusValues().includes(status as IssueStatus);
  }
}

export default Issue; 