/**
 * Obtiene la lista de problemas reportados con opciones de filtrado
 * @param {Object} options - Opciones de filtrado (estado, fecha)
 * @returns {Promise<Array>} Lista de problemas
 */
async function getIssues(options = {}) {
    try {
      const params = {
        TableName: ISSUES_TABLE
      };
  
      // Si hay filtros, los añadimos
      if (options.status || options.startDate || options.endDate) {
        let filterExpressions = [];
        const expressionAttributeValues = {};
  
        if (options.status) {
          filterExpressions.push('status = :status');
          expressionAttributeValues[':status'] = options.status;
        }
  
        if (options.startDate) {
          filterExpressions.push('timestamp >= :startDate');
          expressionAttributeValues[':startDate'] = options.startDate;
        }
  
        if (options.endDate) {
          filterExpressions.push('timestamp <= :endDate');
          expressionAttributeValues[':endDate'] = options.endDate;
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
  }
  