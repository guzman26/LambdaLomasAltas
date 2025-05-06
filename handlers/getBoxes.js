// handlers/getBoxes.js
const {
  getBoxByCode,
  getBoxesByLocation,
  getBoxesByPallet,
  boxExists,
} = require('../models/boxes');
const { dynamoDB, Tables } = require('../models/index');
const createApiResponse = require('../utils/response');

/**
 * Handler GET /boxes
 *   • Sin query params        → devuelve todos los boxes (scan)
 *   • ?codigo=...             → devuelve un solo box
 *   • ?ubicacion=PACKING      → lista por ubicación
 *   • ?palletId=PAL-123       → lista por pallet
 */
module.exports = async event => {
  try {
    const { queryStringParameters = {} } = event;
    const { codigo, ubicacion, palletId } = queryStringParameters;

    // 1) Buscar por código (caso más específico)
    if (codigo) {
      const box = await getBoxByCode(codigo);
      if (!box) {
        return createApiResponse(404, `Box ${codigo} no encontrado`);
      }
      return createApiResponse(200, box);
    }

    // 2) Filtrar por ubicación
    if (ubicacion) {
      const boxes = await getBoxesByLocation(ubicacion);
      return createApiResponse(200, boxes);
    }

    // 3) Filtrar por palletId
    if (palletId) {
      const boxes = await getBoxesByPallet(palletId);
      return createApiResponse(200, boxes);
    }

    // 4) Sin filtros → scan (puedes paginar en prod)
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const ahora = new Date();
    const desde = new Date(ahora.getTime() - THREE_DAYS_MS).toISOString();
    const hasta = ahora.toISOString();

    const params = {
      TableName: Tables.Boxes,
      IndexName: 'pkTipo-fecha_registro-index',
      KeyConditionExpression: 'pkTipo = :box AND #ts BETWEEN :d AND :h',
      ExpressionAttributeNames: { '#ts': 'fecha_registro' },
      ExpressionAttributeValues: {
        ':box': 'BOX',
        ':d': desde,
        ':h': hasta,
      },
      ScanIndexForward: false,
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

    return createApiResponse(200, items);
  } catch (err) {
    console.error('Error en getBoxes handler:', err);
    return createApiResponse(500, `Error al obtener boxes: ${err.message}`);
  }
};
