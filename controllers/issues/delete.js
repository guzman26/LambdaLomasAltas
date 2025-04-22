/**
 * Elimina un issue de la base de datos
 * @param {string} issueId - ID del issue a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
async function deleteIssue(issueId) {
    try {
      if (!issueId) {
        throw new Error('ID de incidencia es requerido');
      }
  
      // Verificar si el issue existe
      const getParams = {
        TableName: ISSUES_TABLE,
        Key: { IssueNumber: issueId }
      };
      
      const existingIssue = await dynamoDB.get(getParams).promise();
      
      if (!existingIssue.Item) {
        throw new Error(`No se encontró la incidencia con ID: ${issueId}`);
      }
  
      // Eliminar el issue
      const deleteParams = {
        TableName: ISSUES_TABLE,
        Key: { IssueNumber: issueId },
        ReturnValues: 'ALL_OLD'
      };
  
      const result = await dynamoDB.delete(deleteParams).promise();
      
      // Registrar la operación
      await dynamoDB.put({
        TableName: ADMIN_LOGS_TABLE,
        Item: {
          operacion: 'DELETE_ISSUE',
          timestamp: new Date().toISOString(),
          issueId,
          deletedItem: result.Attributes,
          usuario: 'ADMIN' // En una implementación real, obtener del contexto de autenticación
        }
      }).promise();
  
      return { 
        deleted: true,
        message: `La incidencia ${issueId} fue eliminada correctamente`
      };
    } catch (error) {
      console.error(`❌ Error al eliminar la incidencia ${issueId}:`, error);
      throw new Error(`Error al eliminar incidencia: ${error.message}`);
    }
  }

module.exports = deleteIssue;