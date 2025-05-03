/**
 * Admin functions for high-level system management
 */
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { getSystemConfig, setSystemConfig } = require('../models/systemConfig');
const createApiResponse = require('../utils/response');

// Tabla de registros de operaciones administrativas
const ADMIN_LOGS_TABLE = 'AdminLogs';
const ISSUES_TABLE = 'Issues';
const EGG_TABLE = 'Boxes';
const PALLETS_TABLE = 'Pallets';
const CONFIG_TABLE = 'SystemConfig';

/**
 * Obtiene un dashboard con métricas clave del sistema
 * @returns {Promise<Object>} Dashboard con métricas del sistema
 */
async function getSystemDashboard() {
  try {
    // Obtenemos conteos de elementos en cada ubicación
    const [packingEggs, bodegaEggs, ventaEggs, pallets, issues] = await Promise.all([
      dynamoDB
        .scan({
          TableName: EGG_TABLE,
          IndexName: 'ubicacion-index',
          KeyConditionExpression: '#ubicacion = :locationValue',
          ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
          ExpressionAttributeValues: { ':locationValue': 'PACKING' },
          Select: 'COUNT',
        })
        .promise(),

      dynamoDB
        .scan({
          TableName: EGG_TABLE,
          IndexName: 'ubicacion-index',
          KeyConditionExpression: '#ubicacion = :locationValue',
          ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
          ExpressionAttributeValues: { ':locationValue': 'BODEGA' },
          Select: 'COUNT',
        })
        .promise(),

      dynamoDB
        .scan({
          TableName: EGG_TABLE,
          IndexName: 'ubicacion-index',
          KeyConditionExpression: '#ubicacion = :locationValue',
          ExpressionAttributeNames: { '#ubicacion': 'ubicacion' },
          ExpressionAttributeValues: { ':locationValue': 'VENTA' },
          Select: 'COUNT',
        })
        .promise(),

      dynamoDB
        .scan({
          TableName: PALLETS_TABLE,
          Select: 'COUNT',
        })
        .promise(),

      dynamoDB
        .scan({
          TableName: ISSUES_TABLE,
          Select: 'COUNT',
        })
        .promise(),
    ]);

    // Obtener pallet activo
    const activePallet = await getSystemConfig('ACTIVE_PALLET_CODE');

    return {
      stats: {
        huevos_en_packing: packingEggs.Count || 0,
        huevos_en_bodega: bodegaEggs.Count || 0,
        huevos_en_venta: ventaEggs.Count || 0,
        total_pallets: pallets.Count || 0,
        issues_pendientes: issues.Count || 0,
      },
      config: {
        pallet_activo: activePallet,
      },
    };
  } catch (error) {
    console.error('❌ Error al obtener dashboard del sistema:', error);
    throw new Error(`Error al obtener métricas del sistema: ${error.message}`);
  }
}

/**
 * Obtiene la lista de problemas reportados con opciones de filtrado
 * @param {Object} options - Opciones de filtrado (estado, fecha)
 * @returns {Promise<Array>} Lista de problemas
 */
async function getIssues(options = {}) {
  try {
    const params = {
      TableName: ISSUES_TABLE,
    };

    // Si hay filtros, los añadimos
    if (options.status || options.startDate || options.endDate) {
      let filterExpressions = [];
      const expressionAttributeValues = {};

      if (options.status) {
        filterExpressions.push('status = :status');
        expressionAttributeValues[':status'] = options.status;
      }

      if (options.startDate) {
        filterExpressions.push('timestamp >= :startDate');
        expressionAttributeValues[':startDate'] = options.startDate;
      }

      if (options.endDate) {
        filterExpressions.push('timestamp <= :endDate');
        expressionAttributeValues[':endDate'] = options.endDate;
      }

      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const result = await dynamoDB.scan(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error('❌ Error al obtener problemas reportados:', error);
    throw new Error(`Error al obtener problemas: ${error.message}`);
  }
}

/**
 * Actualiza el estado de un problema reportado
 * @param {string} issueId - ID del problema
 * @param {string} status - Nuevo estado (PENDING, IN_PROGRESS, RESOLVED)
 * @param {string} resolution - Comentario de resolución (opcional)
 * @returns {Promise<Object>} Problema actualizado
 */
async function updateIssueStatus(issueId, status, resolution = null) {
  try {
    if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      throw new Error('Estado inválido. Debe ser PENDING, IN_PROGRESS o RESOLVED');
    }

    const params = {
      TableName: ISSUES_TABLE,
      Key: { IssueNumber: issueId },
      UpdateExpression: 'SET #estado = :status, lastUpdated = :timestamp',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':timestamp': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    };

    // Si hay comentario de resolución, lo añadimos
    if (resolution && status === 'RESOLVED') {
      params.UpdateExpression += ', resolution = :resolution';
      params.ExpressionAttributeValues[':resolution'] = resolution;
    }

    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  } catch (error) {
    console.error(`❌ Error al actualizar estado del problema ${issueId}:`, error);
    throw new Error(`Error al actualizar estado del problema: ${error.message}`);
  }
}

/**
 * Revisa y corrige inconsistencias en los datos
 * @returns {Promise<Object>} Resultado de la verificación
 */
async function auditAndFixData() {
  try {
    const issues = {
      huevosSinPallets: [],
      palletsInvalidos: [],
      configsInvalidas: [],
    };
    const fixes = {
      huevosCorregidos: 0,
      palletsCorregidos: 0,
      configsCorregidas: 0,
    };

    // 1. Verificar huevos con referencias a pallets inexistentes
    const huevos = await dynamoDB.scan({ TableName: EGG_TABLE }).promise();
    const pallets = await dynamoDB.scan({ TableName: PALLETS_TABLE }).promise();
    const palletIds = new Set(pallets.Items.map(p => p.id || p.codigo));

    for (const huevo of huevos.Items) {
      if (huevo.palletId && !palletIds.has(huevo.palletId)) {
        issues.huevosSinPallets.push(huevo.codigo);

        // Corregir eliminando la referencia al pallet
        await dynamoDB
          .update({
            TableName: EGG_TABLE,
            Key: { codigo: huevo.codigo },
            UpdateExpression: 'REMOVE palletId',
            ConditionExpression: 'palletId = :pid',
            ExpressionAttributeValues: { ':pid': huevo.palletId },
          })
          .promise();

        fixes.huevosCorregidos++;
      }
    }

    // 2. Verificar pallets con información inconsistente
    for (const pallet of pallets.Items) {
      const expectedBoxCount = pallet.cajas ? pallet.cajas.length : 0;

      if (pallet.cantidadCajas !== expectedBoxCount) {
        issues.palletsInvalidos.push(pallet.id || pallet.codigo);

        // Corregir la cantidad
        await dynamoDB
          .update({
            TableName: PALLETS_TABLE,
            Key: { codigo: pallet.id || pallet.codigo },
            UpdateExpression: 'SET cantidadCajas = :count',
            ExpressionAttributeValues: { ':count': expectedBoxCount },
          })
          .promise();

        fixes.palletsCorregidos++;
      }
    }

    // 3. Verificar configuraciones del sistema
    const configs = await dynamoDB.scan({ TableName: CONFIG_TABLE }).promise();
    const activePalletCode = configs.Items.find(
      c => c.configKey === 'ACTIVE_PALLET_CODE'
    )?.configValue;

    if (activePalletCode && !palletIds.has(activePalletCode)) {
      issues.configsInvalidas.push('ACTIVE_PALLET_CODE');

      // Corregir eliminando la referencia al pallet activo
      await setSystemConfig('ACTIVE_PALLET_CODE', null);
      fixes.configsCorregidas++;
    }

    // Registro de la auditoría
    await dynamoDB
      .put({
        TableName: ADMIN_LOGS_TABLE,
        Item: {
          operacion: 'AUDIT_AND_FIX',
          timestamp: new Date().toISOString(),
          issues: issues,
          fixes: fixes,
        },
      })
      .promise();

    return { issues, fixes };
  } catch (error) {
    console.error('❌ Error durante la auditoría y corrección de datos:', error);
    throw new Error(`Error durante la auditoría: ${error.message}`);
  }
}

/**
 * Respalda los datos de la aplicación
 * @returns {Promise<Object>} Información sobre el respaldo
 */
async function backupData() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const s3 = new AWS.S3();
    const backupBucket = process.env.BACKUP_BUCKET || 'huevos-app-backups';

    // Ejecutar exportaciones de cada tabla
    const tables = [EGG_TABLE, PALLETS_TABLE, ISSUES_TABLE, CONFIG_TABLE];
    const backupResults = [];

    for (const table of tables) {
      // Obtener todos los datos de la tabla
      const data = await dynamoDB.scan({ TableName: table }).promise();

      // Guardar en S3
      const key = `backup/${timestamp}/${table}.json`;
      await s3
        .putObject({
          Bucket: backupBucket,
          Key: key,
          Body: JSON.stringify(data.Items),
          ContentType: 'application/json',
        })
        .promise();

      backupResults.push({
        table,
        records: data.Items.length,
        path: `s3://${backupBucket}/${key}`,
      });
    }

    // Registrar el respaldo
    const backupLog = {
      operacion: 'BACKUP',
      timestamp: new Date().toISOString(),
      tables: backupResults,
    };

    await dynamoDB
      .put({
        TableName: ADMIN_LOGS_TABLE,
        Item: backupLog,
      })
      .promise();

    return {
      status: 'success',
      timestamp,
      details: backupResults,
    };
  } catch (error) {
    console.error('❌ Error durante el respaldo de datos:', error);
    throw new Error(`Error al respaldar datos: ${error.message}`);
  }
}

/**
 * Elimina un issue de la base de datos
 * @param {string} issueId - ID del issue a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
async function deleteIssue(issueId) {
  try {
    if (!issueId) {
      throw new Error('ID de incidencia es requerido');
    }

    // Verificar si el issue existe
    const getParams = {
      TableName: ISSUES_TABLE,
      Key: { IssueNumber: issueId },
    };

    const existingIssue = await dynamoDB.get(getParams).promise();

    if (!existingIssue.Item) {
      throw new Error(`No se encontró la incidencia con ID: ${issueId}`);
    }

    // Eliminar el issue
    const deleteParams = {
      TableName: ISSUES_TABLE,
      Key: { IssueNumber: issueId },
      ReturnValues: 'ALL_OLD',
    };

    const result = await dynamoDB.delete(deleteParams).promise();

    // Registrar la operación
    await dynamoDB
      .put({
        TableName: ADMIN_LOGS_TABLE,
        Item: {
          operacion: 'DELETE_ISSUE',
          timestamp: new Date().toISOString(),
          issueId,
          deletedItem: result.Attributes,
          usuario: 'ADMIN', // En una implementación real, obtener del contexto de autenticación
        },
      })
      .promise();

    return {
      deleted: true,
      message: `La incidencia ${issueId} fue eliminada correctamente`,
    };
  } catch (error) {
    console.error(`❌ Error al eliminar la incidencia ${issueId}:`, error);
    throw new Error(`Error al eliminar incidencia: ${error.message}`);
  }
}

// Exportar las funciones para uso externo
module.exports = {
  getSystemDashboard,
  getIssues,
  updateIssueStatus,
  auditAndFixData,
  backupData,
  deleteIssue,
};
