// handlers/postIssue.js
const createApiResponse = require('../utils/response');
const { createIssue }  = require('../models/issues');

module.exports = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const descripcion = body.descripcion;

    // delega la validación al modelo
    const issue = await createIssue(descripcion);

    return createApiResponse(200, {
      message: '✅ Reporte enviado',
      data   : issue
    });

  } catch (err) {
    console.error('❌ Error al reportar issue:', err.message);
    const status = err.message.includes('obligatoria') ? 400 : 500;
    return createApiResponse(status, `❌ Error al reportar issue: ${err.message}`);
  }
};
