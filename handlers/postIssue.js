// handlers/postIssue.js
const createApiResponse = require('../utils/response');
const { createIssue }  = require('../models/issues');

const postIssue = async (descripcion) => {
  try {
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

module.exports = postIssue;