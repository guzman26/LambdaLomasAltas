/**
 * Actualiza el estado de un problema reportado
 * @param {string} issueId - ID del problema
 * @param {string} status - Nuevo estado (PENDING, IN_PROGRESS, RESOLVED)
 * @param {string} resolution - Comentario de resolución (opcional)
 * @returns {Promise<Object>} Problema actualizado
 */
async function updateIssueStatus(issueId, status, resolution = null) {
    try {
      if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
        throw new Error('Estado inválido. Debe ser PENDING, IN_PROGRESS o RESOLVED');
      }
  
      const params = {
        TableName: ISSUES_TABLE,
        Key: { IssueNumber: issueId },
        UpdateExpression: 'SET #estado = :status, lastUpdated = :timestamp',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':timestamp': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      };
  
      // Si hay comentario de resolución, lo añadimos
      if (resolution && status === 'RESOLVED') {
        params.UpdateExpression += ', resolution = :resolution';
        params.ExpressionAttributeValues[':resolution'] = resolution;
      }
  
      const result = await dynamoDB.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error(`❌ Error al actualizar estado del problema ${issueId}:`, error);
      throw new Error(`Error al actualizar estado del problema: ${error.message}`);
    }
  }