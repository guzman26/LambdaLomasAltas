// models/issues.js
const { dynamoDB, Tables } = require('./index');

// Nombre real de la tabla en este stage
const tableName = Tables.Issues;

/**
 * Crear un nuevo issue
 * @param {string} descripcion
 * @returns {Promise<Object>} Issue insertado
 */
async function createIssue(descripcion) {
  if (!descripcion || descripcion.trim() === '') {
    throw new Error('La descripción es obligatoria');
  }

  const issue = {
    IssueNumber: require('uuid').v4(),
    descripcion: descripcion.trim(),
    timestamp: new Date().toISOString(),
    estado: 'PENDING',
  };

  await dynamoDB.put({ TableName: tableName, Item: issue }).promise();
  return issue;
}

/**
 * Obtener un issue por su IssueNumber
 */
async function getIssue(id) {
  const res = await dynamoDB
    .get({
      TableName: tableName,
      Key: { IssueNumber: id },
    })
    .promise();
  return res.Item || null;
}

/**
 * Actualizar estado u otros campos
 */
async function updateIssue(id, updates = {}) {
  const allowed = ['estado', 'descripcion'];
  const exp = [];
  const names = {};
  const values = {};

  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k)) {
      exp.push(`#${k} = :${k}`);
      names[`#${k}`] = k;
      values[`:${k}`] = v;
    }
  }
  if (exp.length === 0) throw new Error('Nada que actualizar');

  const res = await dynamoDB
    .update({
      TableName: tableName,
      Key: { IssueNumber: id },
      UpdateExpression: `SET ${exp.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    })
    .promise();

  return res.Attributes;
}

module.exports = {
  dynamoDB,
  tableName,
  createIssue,
  getIssue,
  updateIssue,
};
