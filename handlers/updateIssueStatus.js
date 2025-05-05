/* eslint-disable consistent-return */
const createApiResponse = require('../utils/response');
const {
  getIssue,
  updateIssue, // ← modelo que realiza el `Update` en DynamoDB
} = require('../models/issues');

/**
 * Cambia el estado (y la resolución opcional) de una incidencia.
 * Se apoya exclusivamente en la capa de modelos; aquí solo hay
 * validación, parsing de la petición y formato de la respuesta.
 *
 * @param {object} event – API Gateway event
 * @returns {Promise<object>} respuesta estándar { statusCode, body }
 */
const updateIssueStatusHandler = async (issueId, status, resolution) => {
  try {
    /* 1️⃣  Validaciones de entrada ------------------------------------------- */
    if (!issueId || !status) return createApiResponse(400, '⚠️ Se requieren issueId y status');

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status))
      return createApiResponse(
        400,
        `⚠️ Estado inválido. Valores permitidos: ${validStatuses.join(', ')}`
      );

    /* 3️⃣  Verificar que exista el issue ------------------------------------- */
    const issue = await getIssue(issueId);
    if (!issue) return createApiResponse(404, `Incidencia ${issueId} no encontrada`);

    /* 4️⃣  Construir objeto de actualización --------------------------------- */
    const updates = { estado: status };
    if (status === 'RESOLVED' && resolution) updates.resolution = resolution.trim();

    /* 5️⃣  Persistir con el modelo ------------------------------------------- */
    const updated = await updateIssue(issueId, updates);

    /* 6️⃣  Responder ---------------------------------------------------------- */
    return createApiResponse(200, '✅ Estado de la incidencia actualizado correctamente', updated);
  } catch (err) {
    console.error('❌ Error en handler updateIssueStatus:', err);
    return createApiResponse(500, `Error interno: ${err.message}`);
  }
};

module.exports = updateIssueStatusHandler;
