const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const createApiResponse = require('../utils/response');

const ISSUES_TABLE = 'Issues';
const ADMIN_LOGS_TABLE = 'AdminLogs';

/**
 * Updates the status of an issue
 * @param {string} issueId - The ID of the issue to update
 * @param {string} status - The new status (pendiente, en_proceso, resuelto)
 * @param {string} resolution - Optional resolution comment
 * @returns {Promise<Object>} Updated issue data
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
        '#estado': 'estado',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':timestamp': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
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

/**
 * Lambda handler for updating issue status
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} API response
 */
exports.handler = async event => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get issueId from path parameters or body
    let issueId;
    if (event.pathParameters && event.pathParameters.issueId) {
      // Path parameter from our custom routing
      issueId = event.pathParameters.issueId;
    } else if (event.path) {
      // Extract from path if not in path parameters
      const pathParts = event.path.split('/');
      const issueIdIndex = pathParts.findIndex(part => part === 'issues') + 1;
      if (issueIdIndex > 0 && issueIdIndex < pathParts.length) {
        issueId = pathParts[issueIdIndex];
      }
    }

    // Parse the request body
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};

    // Extract status and resolution from body
    const { status, resolution } = requestBody;

    console.log(`Updating issue ${issueId} with status: ${status}`);

    // Validate required fields
    if (!issueId || !status) {
      return createApiResponse(400, 'Faltan campos requeridos: issueId y status son obligatorios');
    }

    // Update the issue
    const updatedIssue = await updateIssueStatus(issueId, status, resolution);

    return createApiResponse(
      200,
      'Estado de la incidencia actualizado correctamente',
      updatedIssue
    );
  } catch (error) {
    console.error('❌ Error en Lambda handler para actualizar estado de incidencia:', error);
    return createApiResponse(
      error.message.includes('inválido') ? 400 : 500,
      `Error: ${error.message}`
    );
  }
};

// Export for testing and reuse
module.exports = updateIssueStatus;
