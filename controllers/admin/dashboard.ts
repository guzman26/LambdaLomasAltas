import AWS from 'aws-sdk';
import { ApiResponse } from '../../types';
import SystemConfig from '../../models/SystemConfig';
import Box from '../../models/Box';
import Pallet from '../../models/Pallet';
import Issue from '../../models/Issue';
import * as dbUtils from '../../utils/db';
import createApiResponse from '../../utils/response';
import { getSystemConfig } from './system';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

interface DashboardStats {
  huevos_en_packing: number;
  huevos_en_bodega: number;
  huevos_en_venta: number;
  total_pallets: number;
  issues_pendientes: number;
}

interface DashboardConfig {
  pallet_activo: string | null;
}

interface DashboardData {
  stats: DashboardStats;
  config: DashboardConfig;
}

/**
 * Obtiene un dashboard con métricas clave del sistema
 * @returns {Promise<ApiResponse>} API response with dashboard data
 */
export async function getSystemDashboard(): Promise<ApiResponse> {
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

    const dashboard: DashboardData = {
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
    return createApiResponse(500, `Error al obtener métricas del sistema: ${(error as Error).message}`);
  }
}

export default {
  getSystemDashboard
}; 