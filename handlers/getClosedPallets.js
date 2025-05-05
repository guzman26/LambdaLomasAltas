// handlers/getClosedPallets.js
const { dynamoDB } = require('../models/pallets'); // reutilizamos el cliente
const { tableName } = require('../models/pallets'); // nombre real de la tabla
const createApiResponse = require('../utils/response');

/**
 * Devuelve los pallets cerrados (estado = "closed") en una ubicación dada
 * usando solo QUERY sobre el GSI estado‑fechaCreacion‑GSI.
 *
 * @param {string} ubicacionValue  "PACKING" | "BODEGA" | "VENTA" | etc.
 */
module.exports = async (ubicacionValue = '') => {
  const location = (ubicacionValue || '').toUpperCase().trim();
  if (!location) return createApiResponse(400, 'ubicacion es requerida');

  try {
    const params = {
      TableName: tableName,
      IndexName: 'estado-fechaCreacion-GSI',
      KeyConditionExpression: '#e = :closed',
      FilterExpression: '#u = :loc',
      ExpressionAttributeNames: {
        '#e': 'estado',
        '#u': 'ubicacion',
      },
      ExpressionAttributeValues: {
        ':closed': 'closed',
        ':loc': location,
      },
      ScanIndexForward: false, // opcional: últimos primero
    };

    const items = [];
    let lastKey;

    do {
      const { Items, LastEvaluatedKey } = await dynamoDB
        .query({ ...params, ExclusiveStartKey: lastKey })
        .promise();

      items.push(...Items);
      lastKey = LastEvaluatedKey;
    } while (lastKey);

    return createApiResponse(
      200,
      `✅ Encontrados ${items.length} pallet(s) cerrados en ${location}`,
      items
    );
  } catch (err) {
    console.error('getClosedPallets error:', err);
    return createApiResponse(
      500,
      `❌ Error al obtener pallets cerrados en ${location}: ${err.message}`
    );
  }
};
