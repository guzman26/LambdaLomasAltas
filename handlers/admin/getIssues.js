const { dynamoDB, Tables } = require('../../models/index');


const getIssues = async ({ status, startDate, endDate } = {}) => {
    try {
        const params = {
            TableName: Tables.Issues,
          };
      
          // Si hay filtros, los añadimos
          if (status || startDate || endDate) {
            let filterExpressions = [];
            const expressionAttributeValues = {};
      
            if (status) {
              filterExpressions.push('status = :status');
              expressionAttributeValues[':status'] = status;
            }
      
            if (startDate) {
              filterExpressions.push('timestamp >= :startDate');
              expressionAttributeValues[':startDate'] = startDate;
            }
      
            if (endDate) {
              filterExpressions.push('timestamp <= :endDate');
              expressionAttributeValues[':endDate'] = endDate;
            }
      
            params.FilterExpression = filterExpressions.join(' AND ');
            params.ExpressionAttributeValues = expressionAttributeValues;
          }
      
          const result = await dynamoDB.scan(params).promise();
          return result.Items || [];
        } catch (error) {
          console.error('❌ Error al obtener problemas reportados:', error);
    throw new Error(`Error al obtener problemas: ${error.message}`);
  }
};

module.exports = { getIssues };
