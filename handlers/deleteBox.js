const { deleteBoxCascade } = require('../models/boxes');
const createApiResponse = require('../utils/response');

const deleteBoxHandler = async codigo => {
  try {
    if (!codigo) return createApiResponse(400, 'Falta el código de la caja');

    const result = await deleteBoxCascade(codigo);
    return createApiResponse(result.success ? 200 : 400, result.message);
  } catch (err) {
    console.error('Error en deleteBox handler:', err);
    return createApiResponse(500, `Error interno: ${err.message}`);
  }
};

module.exports = deleteBoxHandler;
