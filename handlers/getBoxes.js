// handlers/getBoxes.js
const {
  getBoxByCode,
  getBoxesByLocation,
  getBoxesByPallet,
  boxExists,
  tableName, // solo para logging o métricas; no se usa el cliente directo
} = require('../models/boxes');

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
    const { dynamoDB } = require('../models/boxes'); // re-usar el mismo cliente
    const result = await dynamoDB.scan({ TableName: tableName }).promise();
    return createApiResponse(200, result.Items);
  } catch (err) {
    console.error('Error en getBoxes handler:', err);
    return createApiResponse(500, `Error al obtener boxes: ${err.message}`);
  }
};
