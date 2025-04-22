const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const Issue = require('../../models/Issue');
const SystemConfig = require('../../models/SystemConfig');
const dbUtils = require('../../utils/db');
const createApiResponse = require('../../utils/response');

/**
 * Obtiene la lista de problemas reportados con opciones de filtrado
 * @param {Object} options - Opciones de filtrado (estado, fecha)
 * @returns {Promise<Object>} API response with issues list
 */
async function getIssues(options = {}) {
  try {
    let filterExpression = [];
    let expressionAttributeValues = {};

    if (options.status) {
      filterExpression.push('status = :status');
      expressionAttributeValues[':status'] = options.status;
    }

    if (options.startDate) {
      filterExpression.push('timestamp >= :startDate');
      expressionAttributeValues[':startDate'] = options.startDate;
    }

    if (options.endDate) {
      filterExpression.push('timestamp <= :endDate');
      expressionAttributeValues[':endDate'] = options.endDate;
    }

    const issues = await dbUtils.scanItems(
      Issue.getTableName(),
      filterExpression.length > 0 ? filterExpression.join(' AND ') : null,
      Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : null
    );

    return createApiResponse(200, "Issues retrieved successfully", issues);
  } catch (error) {
    console.error('❌ Error al obtener problemas reportados:', error);
    return createApiResponse(500, `Error al obtener problemas: ${error.message}`);
  }
}

/**
 * Actualiza el estado de un problema reportado
 * @param {string} issueId - ID del problema
 * @param {string} status - Nuevo estado (PENDING, IN_PROGRESS, RESOLVED)
 * @param {string} resolution - Comentario de resolución (opcional)
 * @returns {Promise<Object>} API response with updated issue
 */
async function updateIssueStatus(issueId, status, resolution = null) {
  try {
    if (!Issue.isValidStatus(status)) {
      return createApiResponse(400, `Estado inválido. Debe ser ${Issue.getStatusValues().join(', ')}`);
    }

    let updateExpression = 'SET #status = :status, lastUpdated = :timestamp';
    const expressionAttributeNames = {
      '#status': 'status'
    };
    const expressionAttributeValues = {
      ':status': status,
      ':timestamp': new Date().toISOString()
    };

    // Si hay comentario de resolución, lo añadimos
    if (resolution && status === 'RESOLVED') {
      updateExpression += ', resolution = :resolution';
      expressionAttributeValues[':resolution'] = resolution;
    }

    const updatedIssue = await dbUtils.updateItem(
      Issue.getTableName(),
      { IssueNumber: issueId },
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames
    );

    if (!updatedIssue) {
      return createApiResponse(404, `No se encontró el issue con ID: ${issueId}`);
    }

    return createApiResponse(200, "Issue status updated successfully", updatedIssue);
  } catch (error) {
    console.error(`❌ Error al actualizar estado del problema ${issueId}:`, error);
    return createApiResponse(500, `Error al actualizar estado del problema: ${error.message}`);
  }
}

/**
 * Elimina un issue de la base de datos
 * @param {string} issueId - ID del issue a eliminar
 * @returns {Promise<Object>} API response with delete result
 */
async function deleteIssue(issueId) {
  try {
    if (!issueId) {
      return createApiResponse(400, 'ID de incidencia es requerido');
    }

    // Verificar si el issue existe
    const existingIssue = await dbUtils.getItem(Issue.getTableName(), { IssueNumber: issueId });
    
    if (!existingIssue) {
      return createApiResponse(404, `No se encontró la incidencia con ID: ${issueId}`);
    }

    // Eliminar el issue
    const deletedIssue = await dbUtils.deleteItem(Issue.getTableName(), { IssueNumber: issueId });
    
    // Registrar la operación
    await dbUtils.putItem(SystemConfig.getAdminLogsTable(), {
      operacion: 'DELETE_ISSUE',
      timestamp: new Date().toISOString(),
      issueId,
      deletedItem: deletedIssue,
      usuario: 'ADMIN' // En una implementación real, obtener del contexto de autenticación
    });

    return createApiResponse(200, `La incidencia ${issueId} fue eliminada correctamente`, { deleted: true });
  } catch (error) {
    console.error(`❌ Error al eliminar la incidencia ${issueId}:`, error);
    return createApiResponse(500, `Error al eliminar incidencia: ${error.message}`);
  }
}

module.exports = {
  getIssues,
  updateIssueStatus,
  deleteIssue
}; 