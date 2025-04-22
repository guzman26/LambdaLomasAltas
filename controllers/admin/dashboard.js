const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const SystemConfig = require('../../models/SystemConfig');
const Box = require('../../models/Box');
const Pallet = require('../../models/Pallet');
const Issue = require('../../models/Issue');
const dbUtils = require('../../utils/db');
const createApiResponse = require('../../utils/response');
const { getSystemConfig } = require('./system');

/**
 * Obtiene un dashboard con métricas clave del sistema
 * @returns {Promise<Object>} API response with dashboard data
 */
async function getSystemDashboard() {
  try {
    // Obtenemos conteos de elementos en cada ubicación
    const [packingEggs, bodegaEggs, ventaEggs, pallets, issues] = await Promise.all([
      dynamoDB.scan({
        TableName: Box.getTableName(),
        IndexName: 'ubicacion-index',
        KeyConditionExpression: '#ubicacion = :locationValue',
        ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
        ExpressionAttributeValues: { ':locationValue': 'PACKING' },
        Select: 'COUNT'
      }).promise(),
      
      dynamoDB.scan({
        TableName: Box.getTableName(),
        IndexName: 'ubicacion-index',
        KeyConditionExpression: '#ubicacion = :locationValue',
        ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
        ExpressionAttributeValues: { ':locationValue': 'BODEGA' },
        Select: 'COUNT'
      }).promise(),
      
      dynamoDB.scan({
        TableName: Box.getTableName(),
        IndexName: 'ubicacion-index',
        KeyConditionExpression: '#ubicacion = :locationValue',
        ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
        ExpressionAttributeValues: { ':locationValue': 'VENTA' },
        Select: 'COUNT'
      }).promise(),
      
      dynamoDB.scan({
        TableName: Pallet.getTableName(),
        Select: 'COUNT'
      }).promise(),
      
      dynamoDB.scan({
        TableName: Issue.getTableName(),
        Select: 'COUNT'
      }).promise()
    ]);

    // Obtener pallet activo
    const activePallet = await getSystemConfig('ACTIVE_PALLET_CODE');

    const dashboard = {
      stats: {
        huevos_en_packing: packingEggs.Count || 0,
        huevos_en_bodega: bodegaEggs.Count || 0,
        huevos_en_venta: ventaEggs.Count || 0,
        total_pallets: pallets.Count || 0,
        issues_pendientes: issues.Count || 0
      },
      config: {
        pallet_activo: activePallet
      }
    };

    return createApiResponse(200, "Dashboard data retrieved successfully", dashboard);
  } catch (error) {
    console.error('❌ Error al obtener dashboard del sistema:', error);
    return createApiResponse(500, `Error al obtener métricas del sistema: ${error.message}`);
  }
}

module.exports = {
  getSystemDashboard
}; 