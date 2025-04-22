const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const SystemConfig = require('../../models/SystemConfig');
const Egg = require('../../models/Egg');
const Pallet = require('../../models/Pallet');
const Issue = require('../../models/Issue');
const dbUtils = require('../../utils/db');
const createApiResponse = require('../../utils/response');

/**
 * Get system configuration
 * @param {string} configKey - Configuration key
 * @returns {Promise<string>} Configuration value
 */
async function getSystemConfig(configKey) {
  try {
    const params = {
      TableName: SystemConfig.getConfigTable(),
      Key: { configKey }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item ? result.Item.configValue : null;
  } catch (error) {
    console.error(`❌ Error getting system config ${configKey}:`, error);
    throw new Error(`Error getting system config: ${error.message}`);
  }
}

/**
 * Set system configuration
 * @param {string} configKey - Configuration key
 * @param {string} configValue - Configuration value
 * @returns {Promise<Object>} Result
 */
async function setSystemConfig(configKey, configValue) {
  try {
    const params = {
      TableName: SystemConfig.getConfigTable(),
      Item: {
        configKey,
        configValue,
        updatedAt: new Date().toISOString()
      }
    };

    await dynamoDB.put(params).promise();
    return { configKey, configValue };
  } catch (error) {
    console.error(`❌ Error setting system config ${configKey}:`, error);
    throw new Error(`Error setting system config: ${error.message}`);
  }
}

/**
 * Revisa y corrige inconsistencias en los datos
 * @returns {Promise<Object>} API response with audit results
 */
async function auditAndFixData() {
  try {
    const issues = {
      huevosSinPallets: [],
      palletsInvalidos: [],
      configsInvalidas: []
    };
    const fixes = {
      huevosCorregidos: 0,
      palletsCorregidos: 0,
      configsCorregidas: 0
    };

    // 1. Verificar huevos con referencias a pallets inexistentes
    const huevos = await dbUtils.scanItems(Egg.getTableName());
    const pallets = await dbUtils.scanItems(Pallet.getTableName());
    const palletIds = new Set(pallets.map(p => p.id || p.codigo));

    for (const huevo of huevos) {
      if (huevo.palletId && !palletIds.has(huevo.palletId)) {
        issues.huevosSinPallets.push(huevo.codigo);
        
        // Corregir eliminando la referencia al pallet
        await dbUtils.updateItem(
          Egg.getTableName(),
          { codigo: huevo.codigo },
          'REMOVE palletId',
          { ':pid': huevo.palletId }
        );
        
        fixes.huevosCorregidos++;
      }
    }

    // 2. Verificar pallets con información inconsistente
    for (const pallet of pallets) {
      const expectedBoxCount = pallet.cajas ? pallet.cajas.length : 0;
      
      if (pallet.cantidadCajas !== expectedBoxCount) {
        issues.palletsInvalidos.push(pallet.id || pallet.codigo);
        
        // Corregir la cantidad
        await dbUtils.updateItem(
          Pallet.getTableName(),
          { codigo: pallet.id || pallet.codigo },
          'SET cantidadCajas = :count',
          { ':count': expectedBoxCount }
        );
        
        fixes.palletsCorregidos++;
      }
    }

    // 3. Verificar configuraciones del sistema
    const activePalletCode = await getSystemConfig('ACTIVE_PALLET_CODE');
    
    if (activePalletCode && !palletIds.has(activePalletCode)) {
      issues.configsInvalidas.push('ACTIVE_PALLET_CODE');
      
      // Corregir eliminando la referencia al pallet activo
      await setSystemConfig('ACTIVE_PALLET_CODE', null);
      fixes.configsCorregidas++;
    }
    
    // Registro de la auditoría
    await dbUtils.putItem(SystemConfig.getAdminLogsTable(), {
      operacion: 'AUDIT_AND_FIX',
      timestamp: new Date().toISOString(),
      issues: issues,
      fixes: fixes
    });

    return createApiResponse(200, "Audit and fix completed successfully", { issues, fixes });
  } catch (error) {
    console.error('❌ Error durante la auditoría y corrección de datos:', error);
    return createApiResponse(500, `Error durante la auditoría: ${error.message}`);
  }
}

/**
 * Respalda los datos de la aplicación
 * @returns {Promise<Object>} API response with backup results
 */
async function backupData() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupBucket = process.env.BACKUP_BUCKET || 'huevos-app-backups';
    
    // Ejecutar exportaciones de cada tabla
    const tables = [
      Egg.getTableName(),
      Pallet.getTableName(),
      Issue.getTableName(),
      SystemConfig.getConfigTable()
    ];
    const backupResults = [];
    
    for (const table of tables) {
      // Obtener todos los datos de la tabla
      const data = await dbUtils.scanItems(table);
      
      // Guardar en S3
      const key = `backup/${timestamp}/${table}.json`;
      await s3.putObject({
        Bucket: backupBucket,
        Key: key,
        Body: JSON.stringify(data),
        ContentType: 'application/json'
      }).promise();
      
      backupResults.push({
        table,
        records: data.length,
        path: `s3://${backupBucket}/${key}`
      });
    }
    
    // Registrar el respaldo
    await dbUtils.putItem(SystemConfig.getAdminLogsTable(), {
      operacion: 'BACKUP',
      timestamp: new Date().toISOString(),
      tables: backupResults
    });
    
    return createApiResponse(200, "Backup completed successfully", {
      status: 'success',
      timestamp,
      details: backupResults
    });
  } catch (error) {
    console.error('❌ Error durante el respaldo de datos:', error);
    return createApiResponse(500, `Error al respaldar datos: ${error.message}`);
  }
}

module.exports = {
  getSystemConfig,
  setSystemConfig,
  auditAndFixData,
  backupData
}; 