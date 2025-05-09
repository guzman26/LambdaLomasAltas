const { dynamoDB, Tables } = require('../models/index');
const createApiResponse = require('../utils/response');

const TABLE_NAME = Tables.Boxes; // e.g. 'Boxes-dev'

/**
 * Body esperado: { "codigos": ["516251222021001", "516251222021002", ...] }
 */
module.exports = async event => {
  try {
    const { codigos } = JSON.parse(event.body || '{}');

    if (!Array.isArray(codigos) || codigos.length === 0) {
      return createApiResponse(
        400,
        "Debe proporcionar un arreglo 'codigos' con al menos un elemento."
      );
    }

    /* 1️⃣  Sanitizar — quitar vacíos y duplicados */
    const uniqueCodes = [...new Set(codigos.filter(Boolean))];

    /* 2️⃣  Fragmentar en bloques de 100 */
    const batches = [];
    for (let i = 0; i < uniqueCodes.length; i += 100) {
      batches.push(uniqueCodes.slice(i, i + 100));
    }

    const results = [];

    for (const batch of batches) {
      /* ---------- BatchGet ---------- */
      let params = {
        RequestItems: {
          [TABLE_NAME]: {
            Keys: batch.map(codigo => ({ codigo })), // PK = 'codigo'
          },
        },
      };

      let response = await dynamoDB.batchGet(params).promise();
      results.push(...response.Responses[TABLE_NAME]);

      /* 3️⃣  Reintento rápido si Dynamo devolvió claves sin procesar */
      if (
        response.UnprocessedKeys &&
        response.UnprocessedKeys[TABLE_NAME] &&
        response.UnprocessedKeys[TABLE_NAME].Keys.length > 0
      ) {
        console.warn(
          `⏳ Reintentando ${response.UnprocessedKeys[TABLE_NAME].Keys.length} claves sin procesar…`
        );
        params.RequestItems = response.UnprocessedKeys;
        const retry = await dynamoDB.batchGet(params).promise();
        results.push(...retry.Responses[TABLE_NAME]);
      }
    }

    return createApiResponse(200, { count: results.length, items: results });
  } catch (err) {
    console.error('❌ Error fetching box details:', err);
    return createApiResponse(500, 'Error interno al obtener detalles de las cajas', {
      error: err.message,
    });
  }
};
