const { dynamoDB, Tables } = require('../../models/index');

async function updateIssueStatus(issueId, status, resolution = null) {
  try {
    if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      throw new Error('Estado inválido. Debe ser PENDING, IN_PROGRESS o RESOLVED');
    }

    const params = {
      TableName: Tables.Issues,
      Key: { IssueNumber: issueId },
      UpdateExpression: 'SET #s = :status, lastUpdated = :ts',
      ExpressionAttributeNames: {
        '#s': 'estado',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':ts': new Date().toISOString(),
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
