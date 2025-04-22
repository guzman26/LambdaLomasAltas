"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemDashboard = getSystemDashboard;
exports.getIssues = getIssues;
exports.updateIssueStatus = updateIssueStatus;
exports.auditAndFixData = auditAndFixData;
exports.backupData = backupData;
exports.deleteIssue = deleteIssue;
/**
 * Admin functions for high-level system management
 */
const AWS = __importStar(require("aws-sdk"));
// Assuming systemConfig and utils/response are also converted to TypeScript
const system_1 = require("../controllers/admin/system");
// import createApiResponse from '../utils/response'; // Import if needed, but not used in these functions
// Configure AWS if not already configured
// AWS.config.update({ region: "your-region" }); // Uncomment and set your region if needed
const dynamoDB = new AWS.DynamoDB.DocumentClient();
// Table Names
const ADMIN_LOGS_TABLE = 'AdminLogs';
const ISSUES_TABLE = 'Issues';
const EGG_TABLE = 'Huevos';
const PALLETS_TABLE = 'Pallets';
const CONFIG_TABLE = 'SystemConfig';
/**
 * Obtiene un dashboard con métricas clave del sistema
 * @returns {Promise<SystemDashboard>} Dashboard con métricas del sistema
 */
async function getSystemDashboard() {
    try {
        // Obtenemos conteos de elementos en cada ubicación
        const [packingEggs, bodegaEggs, ventaEggs, pallets, issues] = await Promise.all([
            dynamoDB.scan({
                TableName: EGG_TABLE,
                IndexName: 'ubicacion-index', // Ensure this index exists in DynamoDB
                FilterExpression: 'ubicacion = :locationValue',
                ExpressionAttributeValues: { ':locationValue': 'PACKING' },
                Select: 'COUNT'
            }).promise(),
            dynamoDB.scan({
                TableName: EGG_TABLE,
                IndexName: 'ubicacion-index', // Ensure this index exists in DynamoDB
                FilterExpression: 'ubicacion = :locationValue',
                ExpressionAttributeValues: { ':locationValue': 'BODEGA' },
                Select: 'COUNT'
            }).promise(),
            dynamoDB.scan({
                TableName: EGG_TABLE,
                IndexName: 'ubicacion-index', // Ensure this index exists in DynamoDB
                FilterExpression: 'ubicacion = :locationValue',
                ExpressionAttributeValues: { ':locationValue': 'VENTA' },
                Select: 'COUNT'
            }).promise(),
            dynamoDB.scan({
                TableName: PALLETS_TABLE,
                Select: 'COUNT'
            }).promise(),
            dynamoDB.scan({
                TableName: ISSUES_TABLE,
                Select: 'COUNT'
            }).promise()
        ]);
        // Obtener pallet activo
        const activePallet = await (0, system_1.getSystemConfig)('ACTIVE_PALLET_CODE');
        return {
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
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error('❌ Error al obtener dashboard del sistema:', error);
        throw new Error(`Error al obtener métricas del sistema: ${error.message}`);
    }
}
/**
 * Obtiene la lista de problemas reportados con opciones de filtrado
 * @param {GetIssuesOptions} options - Opciones de filtrado (estado, fecha)
 * @returns {Promise<Issue[]>} Lista de problemas
 */
async function getIssues(options = {}) {
    try {
        const params = {
            TableName: ISSUES_TABLE
        };
        // Si hay filtros, los añadimos
        if (options.status || options.startDate || options.endDate) {
            let filterExpressions = [];
            const expressionAttributeValues = {};
            const expressionAttributeNames = {};
            if (options.status) {
                // Use a placeholder for 'status' since it's a reserved word
                filterExpressions.push('#statusAttr = :statusValue');
                expressionAttributeNames['#statusAttr'] = 'status';
                expressionAttributeValues[':statusValue'] = options.status;
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
            params.ExpressionAttributeNames = expressionAttributeNames;
        }
        const result = await dynamoDB.scan(params).promise();
        return result.Items || [];
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error('❌ Error al obtener problemas reportados:', error);
        throw new Error(`Error al obtener problemas: ${error.message}`);
    }
}
/**
 * Actualiza el estado de un problema reportado
 * @param {string} issueId - ID del problema
 * @param {'PENDING' | 'IN_PROGRESS' | 'RESOLVED'} status - Nuevo estado
 * @param {string | null} resolution - Comentario de resolución (opcional)
 * @returns {Promise<Issue | undefined>} Problema actualizado, or undefined if not found
 */
async function updateIssueStatus(issueId, status, resolution = null) {
    try {
        if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
            throw new Error('Estado inválido. Debe ser PENDING, IN_PROGRESS o RESOLVED');
        }
        const params = {
            TableName: ISSUES_TABLE,
            Key: { IssueNumber: issueId },
            UpdateExpression: 'SET #statusAttr = :statusValue, lastUpdated = :timestamp',
            ExpressionAttributeNames: {
                '#statusAttr': 'status'
            },
            ExpressionAttributeValues: {
                ':statusValue': status,
                ':timestamp': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };
        // Si hay comentario de resolución, lo añadimos
        if (resolution !== null && status === 'RESOLVED') {
            params.UpdateExpression += ', resolution = :resolution';
            // Ensure ExpressionAttributeValues exists before accessing it
            if (!params.ExpressionAttributeValues) {
                params.ExpressionAttributeValues = {};
            }
            params.ExpressionAttributeValues[':resolution'] = resolution;
        }
        const result = await dynamoDB.update(params).promise();
        return result.Attributes;
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error(`❌ Error al actualizar estado del problema ${issueId}:`, error);
        throw new Error(`Error al actualizar estado del problema: ${error.message}`);
    }
}
/**
 * Revisa y corrige inconsistencias en los datos
 * @returns {Promise<AuditResults>} Resultado de la verificación
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
        const huevosResult = await dynamoDB.scan({ TableName: EGG_TABLE }).promise();
        const huevos = huevosResult.Items || [];
        const palletsResult = await dynamoDB.scan({ TableName: PALLETS_TABLE }).promise();
        const pallets = palletsResult.Items || [];
        // Use 'codigo' as the primary key identifier for pallets
        const palletIds = new Set(pallets.map(p => p.codigo));
        for (const huevo of huevos) {
            // Check if palletId exists and if it refers to a non-existent pallet using 'codigo'
            if (huevo.palletId && !palletIds.has(huevo.palletId)) {
                issues.huevosSinPallets.push(huevo.codigo);
                // Corregir eliminando la referencia al pallet
                try {
                    await dynamoDB.update({
                        TableName: EGG_TABLE,
                        Key: { codigo: huevo.codigo },
                        UpdateExpression: 'REMOVE palletId',
                        ConditionExpression: 'attribute_exists(palletId)', // Ensure palletId exists before removing
                    }).promise();
                    fixes.huevosCorregidos++;
                }
                catch (updateError) {
                    // Handle cases where the item might have been updated concurrently
                    if (updateError.code === 'ConditionalCheckFailedException') {
                        console.warn(`Conditional check failed for egg ${huevo.codigo}. palletId might have been removed concurrently.`);
                    }
                    else {
                        console.error(`Error fixing huevo ${huevo.codigo}:`, updateError);
                    }
                }
            }
        }
        // 2. Verificar pallets con información inconsistente
        for (const pallet of pallets) {
            const expectedBoxCount = pallet.cajas ? pallet.cajas.length : 0;
            if (pallet.cantidadCajas !== expectedBoxCount) {
                // Use 'codigo' for identifying the invalid pallet
                issues.palletsInvalidos.push(pallet.codigo);
                // Corregir la cantidad
                try {
                    await dynamoDB.update({
                        TableName: PALLETS_TABLE,
                        // Use 'codigo' as the key name
                        Key: { codigo: pallet.codigo },
                        UpdateExpression: 'SET cantidadCajas = :count',
                        ExpressionAttributeValues: { ':count': expectedBoxCount }
                    }).promise();
                    fixes.palletsCorregidos++;
                }
                catch (updateError) {
                    console.error(`Error fixing pallet ${pallet.codigo}:`, updateError);
                }
            }
        }
        // 3. Verificar configuraciones del sistema
        const configsResult = await dynamoDB.scan({ TableName: CONFIG_TABLE }).promise();
        const configs = configsResult.Items || [];
        const activePalletConfig = configs.find(c => c.configKey === 'ACTIVE_PALLET_CODE');
        const activePalletCode = activePalletConfig === null || activePalletConfig === void 0 ? void 0 : activePalletConfig.configValue;
        // Check if the active pallet code exists and if it refers to a non-existent pallet using 'codigo'
        if (activePalletCode && !palletIds.has(activePalletCode)) {
            issues.configsInvalidas.push('ACTIVE_PALLET_CODE');
            // Corregir eliminando la referencia al pallet activo
            try {
                await (0, system_1.setSystemConfig)('ACTIVE_PALLET_CODE', null);
                fixes.configsCorregidas++;
            }
            catch (setError) {
                console.error(`Error fixing system config ACTIVE_PALLET_CODE:`, setError);
            }
        }
        // Registro de la auditoría
        const adminLog = {
            operacion: 'AUDIT_AND_FIX',
            timestamp: new Date().toISOString(),
            issues: issues, // Log the found issues
            fixes: fixes // Log the applied fixes
        };
        await dynamoDB.put({
            TableName: ADMIN_LOGS_TABLE,
            Item: adminLog
        }).promise();
        return { issues, fixes };
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error('❌ Error durante la auditoría y corrección de datos:', error);
        throw new Error(`Error durante la auditoría: ${error.message}`);
    }
}
/**
 * Respalda los datos de la aplicación
 * @returns {Promise<BackupInfo>} Información sobre el respaldo
 */
async function backupData() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const s3 = new AWS.S3();
        // Use a default bucket name if the environment variable is not set
        const backupBucket = process.env.BACKUP_BUCKET || 'huevos-app-backups-default'; // Consider a more robust naming convention or configuration
        // Execute exports for each table
        const tablesToBackup = [EGG_TABLE, PALLETS_TABLE, ISSUES_TABLE, CONFIG_TABLE, ADMIN_LOGS_TABLE]; // Include AdminLogs table in backup
        const backupResults = [];
        for (const table of tablesToBackup) {
            try {
                // Get all data from the table (handle large tables with pagination if necessary)
                const scanParams = { TableName: table };
                let allItems = [];
                let lastEvaluatedKey;
                do {
                    const data = await dynamoDB.scan(scanParams).promise();
                    if (data.Items) {
                        allItems = allItems.concat(data.Items);
                    }
                    lastEvaluatedKey = data.LastEvaluatedKey;
                    scanParams.ExclusiveStartKey = lastEvaluatedKey;
                } while (lastEvaluatedKey);
                // Save to S3
                const key = `backup/${timestamp}/${table}.json`;
                // Ensure the bucket exists before putting the object (optional, but good practice)
                // try {
                //     await s3.headBucket({ Bucket: backupBucket }).promise();
                // } catch (err: any) {
                //      if (err.code === 'NotFound') {
                //          // Bucket does not exist, create it (consider region and permissions)
                //          await s3.createBucket({ Bucket: backupBucket }).promise();
                //      } else {
                //          throw err; // Re-throw other errors
                //      }
                // }
                await s3.putObject({
                    Bucket: backupBucket,
                    Key: key,
                    Body: JSON.stringify(allItems),
                    ContentType: 'application/json'
                }).promise();
                backupResults.push({
                    table,
                    records: allItems.length,
                    path: `s3://${backupBucket}/${key}`
                });
                console.log(`✅ Backed up ${table} with ${allItems.length} records to s3://${backupBucket}/${key}`);
            }
            catch (tableError) {
                console.error(`❌ Error backing up table ${table}:`, tableError);
                // Optionally continue with other tables or throw immediately
                backupResults.push({
                    table,
                    records: 0,
                    path: `Error: ${tableError.message}`
                });
            }
        }
        // Register the backup
        const backupLog = {
            operacion: 'BACKUP',
            timestamp: new Date().toISOString(),
            tables: backupResults // Log the results for each table
        };
        // Attempt to log the backup result, even if some tables failed
        try {
            await dynamoDB.put({
                TableName: ADMIN_LOGS_TABLE,
                Item: backupLog
            }).promise();
            console.log(`✅ Backup operation logged to ${ADMIN_LOGS_TABLE}`);
        }
        catch (logError) {
            console.error(`❌ Error logging backup operation to ${ADMIN_LOGS_TABLE}:`, logError);
            // Decide how to handle logging failure (throw or just warn)
        }
        // Check if all tables were successfully backed up
        const allTablesBackedUp = tablesToBackup.every(table => backupResults.some(res => res.table === table && !res.path.startsWith('Error:')));
        return {
            status: allTablesBackedUp ? 'success' : 'partial_success',
            timestamp,
            details: backupResults
        };
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error('❌ Error durante el respaldo de datos:', error);
        // Log a failed backup attempt
        const failedBackupLog = {
            operacion: 'BACKUP_FAILED',
            timestamp: new Date().toISOString(),
            errorMessage: error.message
        };
        try {
            await dynamoDB.put({ TableName: ADMIN_LOGS_TABLE, Item: failedBackupLog }).promise();
        }
        catch (logError) {
            console.error('❌ Failed to log failed backup operation:', logError);
        }
        throw new Error(`Error al respaldar datos: ${error.message}`);
    }
}
/**
 * Elimina un issue de la base de datos
 * @param {string} issueId - ID del issue a eliminar
 * @returns {Promise<DeleteIssueResult>} Resultado de la operación
 */
async function deleteIssue(issueId) {
    try {
        if (!issueId) {
            throw new Error('ID de incidencia es requerido');
        }
        // Verificar si el issue existe
        const getParams = {
            TableName: ISSUES_TABLE,
            Key: { IssueNumber: issueId }
        };
        const existingIssue = await dynamoDB.get(getParams).promise();
        if (!existingIssue.Item) {
            throw new Error(`No se encontró la incidencia con ID: ${issueId}`);
        }
        // Eliminar el issue
        const deleteParams = {
            TableName: ISSUES_TABLE,
            Key: { IssueNumber: issueId },
            ReturnValues: 'ALL_OLD' // Return the item that was deleted
        };
        const result = await dynamoDB.delete(deleteParams).promise();
        const deletedItem = result.Attributes; // This will be the deleted item or undefined if it didn't exist
        // Register the operation
        const adminLog = {
            operacion: 'DELETE_ISSUE',
            timestamp: new Date().toISOString(),
            issueId: issueId,
            deletedItem: deletedItem, // Log the actual item deleted
            usuario: 'ADMIN' // In a real implementation, get from authentication context
        };
        await dynamoDB.put({
            TableName: ADMIN_LOGS_TABLE,
            Item: adminLog
        }).promise();
        return {
            deleted: true,
            message: `La incidencia ${issueId} fue eliminada correctamente`
        };
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error(`❌ Error al eliminar la incidencia ${issueId}:`, error);
        throw new Error(`Error al eliminar incidencia: ${error.message}`);
    }
}
// Export functions for external use
// Using named exports
// export { getSystemDashboard, getIssues, updateIssueStatus, auditAndFixData, backupData, deleteIssue };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9oYW5kbGVycy9hZG1pbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBIQSxnREEwREM7QUFPRCw4QkF5Q0M7QUFTRCw4Q0FvQ0M7QUFNRCwwQ0E4R0M7QUFNRCxnQ0FpSEM7QUFPRCxrQ0FrREM7QUFyakJEOztHQUVHO0FBQ0gsNkNBQStCO0FBRS9CLDRFQUE0RTtBQUM1RSx3REFBK0U7QUFDL0UsMEdBQTBHO0FBRTFHLDBDQUEwQztBQUMxQywyRkFBMkY7QUFFM0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRW5ELGNBQWM7QUFDZCxNQUFNLGdCQUFnQixHQUFXLFdBQVcsQ0FBQztBQUM3QyxNQUFNLFlBQVksR0FBVyxRQUFRLENBQUM7QUFDdEMsTUFBTSxTQUFTLEdBQVcsUUFBUSxDQUFDO0FBQ25DLE1BQU0sYUFBYSxHQUFXLFNBQVMsQ0FBQztBQUN4QyxNQUFNLFlBQVksR0FBVyxjQUFjLENBQUM7QUFtRzVDOzs7R0FHRztBQUNJLEtBQUssVUFBVSxrQkFBa0I7SUFDcEMsSUFBSSxDQUFDO1FBQ0QsbURBQW1EO1FBQ25ELE1BQU0sQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQzVFLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ1YsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSx1Q0FBdUM7Z0JBQ3JFLGdCQUFnQixFQUFFLDRCQUE0QjtnQkFDOUMseUJBQXlCLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUU7Z0JBQzFELE1BQU0sRUFBRSxPQUFPO2FBQ2xCLENBQUMsQ0FBQyxPQUFPLEVBQUU7WUFF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QUFFLFdBQVcsRUFBRSw4QkFBOEI7WUFDeEQsT0FBTyxFQUFFLE9BQU8sQ0FBQyw0REFBNEQ7U0FDaEYsQ0FBQztRQUVGLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUNmLFNBQVMsRUFBRSxnQkFBZ0I7WUFDM0IsSUFBSSxFQUFFLFFBQVE7U0FDakIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIsT0FBTztZQUNILE9BQU8sRUFBRSxJQUFJO1lBQ2IsT0FBTyxFQUFFLGlCQUFpQixPQUFPLDhCQUE4QjtTQUNsRSxDQUFDO0lBQ04sQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUMsQ0FBQyx1REFBdUQ7UUFDMUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsT0FBTyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEUsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDdEUsQ0FBQztBQUNMLENBQUM7QUFFRCxvQ0FBb0M7QUFDcEMsc0JBQXNCO0FBQ3RCLHlHQUF5RyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQWRtaW4gZnVuY3Rpb25zIGZvciBoaWdoLWxldmVsIHN5c3RlbSBtYW5hZ2VtZW50XG4gKi9cbmltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7IERvY3VtZW50Q2xpZW50IH0gZnJvbSAnYXdzLXNkay9jbGllbnRzL2R5bmFtb2RiJztcbi8vIEFzc3VtaW5nIHN5c3RlbUNvbmZpZyBhbmQgdXRpbHMvcmVzcG9uc2UgYXJlIGFsc28gY29udmVydGVkIHRvIFR5cGVTY3JpcHRcbmltcG9ydCB7IGdldFN5c3RlbUNvbmZpZywgc2V0U3lzdGVtQ29uZmlnIH0gZnJvbSAnLi4vY29udHJvbGxlcnMvYWRtaW4vc3lzdGVtJztcbi8vIGltcG9ydCBjcmVhdGVBcGlSZXNwb25zZSBmcm9tICcuLi91dGlscy9yZXNwb25zZSc7IC8vIEltcG9ydCBpZiBuZWVkZWQsIGJ1dCBub3QgdXNlZCBpbiB0aGVzZSBmdW5jdGlvbnNcblxuLy8gQ29uZmlndXJlIEFXUyBpZiBub3QgYWxyZWFkeSBjb25maWd1cmVkXG4vLyBBV1MuY29uZmlnLnVwZGF0ZSh7IHJlZ2lvbjogXCJ5b3VyLXJlZ2lvblwiIH0pOyAvLyBVbmNvbW1lbnQgYW5kIHNldCB5b3VyIHJlZ2lvbiBpZiBuZWVkZWRcblxuY29uc3QgZHluYW1vREIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbi8vIFRhYmxlIE5hbWVzXG5jb25zdCBBRE1JTl9MT0dTX1RBQkxFOiBzdHJpbmcgPSAnQWRtaW5Mb2dzJztcbmNvbnN0IElTU1VFU19UQUJMRTogc3RyaW5nID0gJ0lzc3Vlcyc7XG5jb25zdCBFR0dfVEFCTEU6IHN0cmluZyA9ICdIdWV2b3MnO1xuY29uc3QgUEFMTEVUU19UQUJMRTogc3RyaW5nID0gJ1BhbGxldHMnO1xuY29uc3QgQ09ORklHX1RBQkxFOiBzdHJpbmcgPSAnU3lzdGVtQ29uZmlnJztcblxuLy8gSW50ZXJmYWNlIERlZmluaXRpb25zXG5cbmludGVyZmFjZSBFZ2cge1xuICAgIGNvZGlnbzogc3RyaW5nO1xuICAgIHViaWNhY2lvbjogJ1BBQ0tJTkcnIHwgJ0JPREVHQScgfCAnVkVOVEEnIHwgc3RyaW5nOyAvLyBBZGQgb3RoZXIgbG9jYXRpb25zIGlmIGFwcGxpY2FibGVcbiAgICBwYWxsZXRJZD86IHN0cmluZzsgLy8gT3B0aW9uYWwgcmVmZXJlbmNlIHRvIGEgcGFsbGV0XG4gICAgLy8gQWRkIG90aGVyIGVnZyBwcm9wZXJ0aWVzIGlmIGtub3duXG59XG5cbmludGVyZmFjZSBQYWxsZXQge1xuICAgIGNvZGlnbzogc3RyaW5nO1xuICAgIGlkPzogc3RyaW5nOyAvLyAnaWQnIG9yICdjb2RpZ28nIHNlZW1zIHRvIGJlIHVzZWQgYXMgcHJpbWFyeSBrZXlcbiAgICBlc3RhZG86ICdvcGVuJyB8ICdjbG9zZWQnIHwgc3RyaW5nOyAvLyBBc3N1bWluZyBlc3RhZG8gY2FuIGJlIG90aGVyIHN0cmluZ3NcbiAgICBjYW50aWRhZENhamFzOiBudW1iZXI7XG4gICAgY2FqYXM/OiBzdHJpbmdbXTsgLy8gQXJyYXkgb2YgYm94IGNvZGVzXG4gICAgLy8gQWRkIG90aGVyIHBhbGxldCBwcm9wZXJ0aWVzIGlmIGtub3duXG59XG5cbmludGVyZmFjZSBJc3N1ZSB7XG4gICAgSXNzdWVOdW1iZXI6IHN0cmluZzsgLy8gUHJpbWFyeSBrZXlcbiAgICBzdGF0dXM6ICdQRU5ESU5HJyB8ICdJTl9QUk9HUkVTUycgfCAnUkVTT0xWRUQnIHwgc3RyaW5nO1xuICAgIHRpbWVzdGFtcDogc3RyaW5nOyAvLyBJU08gODYwMSBzdHJpbmdcbiAgICBsYXN0VXBkYXRlZD86IHN0cmluZzsgLy8gSVNPIDg2MDEgc3RyaW5nXG4gICAgcmVzb2x1dGlvbj86IHN0cmluZzsgLy8gQ29tbWVudCBmb3IgcmVzb2x1dGlvblxuICAgIC8vIEFkZCBvdGhlciBpc3N1ZSBwcm9wZXJ0aWVzIGlmIGtub3duIChlLmcuLCBkZXNjcmlwdGlvbiwgcmVwb3J0ZWRCeSwgZXRjLilcbn1cblxuaW50ZXJmYWNlIFN5c3RlbUNvbmZpZ0l0ZW0ge1xuICAgIGNvbmZpZ0tleTogc3RyaW5nOyAvLyBQcmltYXJ5IGtleVxuICAgIGNvbmZpZ1ZhbHVlOiBhbnk7IC8vIFZhbHVlIGNhbiBiZSBvZiB2YXJpb3VzIHR5cGVzXG4gICAgLy8gQWRkIG90aGVyIGNvbmZpZyBwcm9wZXJ0aWVzIGlmIGtub3duXG59XG5cbmludGVyZmFjZSBBZG1pbkxvZ0l0ZW0ge1xuICAgIG9wZXJhY2lvbjogc3RyaW5nO1xuICAgIHRpbWVzdGFtcDogc3RyaW5nOyAvLyBJU08gODYwMSBzdHJpbmdcbiAgICBpc3N1ZXM/OiBhbnk7IC8vIERldGFpbHMgYWJvdXQgaXNzdWVzIGZvdW5kL2ZpeGVkXG4gICAgZml4ZXM/OiBhbnk7IC8vIERldGFpbHMgYWJvdXQgZml4ZXMgYXBwbGllZFxuICAgIHRhYmxlcz86IEJhY2t1cFJlc3VsdFtdOyAvLyBEZXRhaWxzIGFib3V0IGJhY2t1cCB0YWJsZXNcbiAgICBpc3N1ZUlkPzogc3RyaW5nOyAvLyBGb3IgZGVsZXRlIG9wZXJhdGlvbnNcbiAgICBkZWxldGVkSXRlbT86IGFueTsgLy8gRGV0YWlscyBvZiB0aGUgaXRlbSBkZWxldGVkXG4gICAgdXN1YXJpbz86IHN0cmluZzsgLy8gVXNlciBwZXJmb3JtaW5nIHRoZSBvcGVyYXRpb24gKGlmIGFwcGxpY2FibGUpXG4gICAgZGV0YWlscz86IGFueTsgLy8gQWRkZWQgZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgZXJyb3JNZXNzYWdlPzogc3RyaW5nOyAvLyBBZGRlZCBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAvLyBBZGQgb3RoZXIgbG9nIHByb3BlcnRpZXNcbn1cblxuaW50ZXJmYWNlIEdldElzc3Vlc09wdGlvbnMge1xuICAgIHN0YXR1cz86ICdQRU5ESU5HJyB8ICdJTl9QUk9HUkVTUycgfCAnUkVTT0xWRUQnIHwgc3RyaW5nO1xuICAgIHN0YXJ0RGF0ZT86IHN0cmluZzsgLy8gSVNPIDg2MDEgc3RyaW5nXG4gICAgZW5kRGF0ZT86IHN0cmluZzsgLy8gSVNPIDg2MDEgc3RyaW5nXG59XG5cbmludGVyZmFjZSBTeXN0ZW1EYXNoYm9hcmQge1xuICAgIHN0YXRzOiB7XG4gICAgICAgIGh1ZXZvc19lbl9wYWNraW5nOiBudW1iZXI7XG4gICAgICAgIGh1ZXZvc19lbl9ib2RlZ2E6IG51bWJlcjtcbiAgICAgICAgaHVldm9zX2VuX3ZlbnRhOiBudW1iZXI7XG4gICAgICAgIHRvdGFsX3BhbGxldHM6IG51bWJlcjtcbiAgICAgICAgaXNzdWVzX3BlbmRpZW50ZXM6IG51bWJlcjtcbiAgICB9O1xuICAgIGNvbmZpZzoge1xuICAgICAgICBwYWxsZXRfYWN0aXZvOiBhbnk7IC8vIFR5cGUgZGVwZW5kcyBvbiB3aGF0IEFDVElWRV9QQUxMRVRfQ09ERSBzdG9yZXNcbiAgICB9O1xufVxuXG5pbnRlcmZhY2UgQXVkaXRSZXN1bHRzIHtcbiAgICBpc3N1ZXM6IHtcbiAgICAgICAgaHVldm9zU2luUGFsbGV0czogc3RyaW5nW107XG4gICAgICAgIHBhbGxldHNJbnZhbGlkb3M6IHN0cmluZ1tdO1xuICAgICAgICBjb25maWdzSW52YWxpZGFzOiBzdHJpbmdbXTtcbiAgICB9O1xuICAgIGZpeGVzOiB7XG4gICAgICAgIGh1ZXZvc0NvcnJlZ2lkb3M6IG51bWJlcjtcbiAgICAgICAgcGFsbGV0c0NvcnJlZ2lkb3M6IG51bWJlcjtcbiAgICAgICAgY29uZmlnc0NvcnJlZ2lkYXM6IG51bWJlcjtcbiAgICB9O1xufVxuXG5pbnRlcmZhY2UgQmFja3VwUmVzdWx0IHtcbiAgICB0YWJsZTogc3RyaW5nO1xuICAgIHJlY29yZHM6IG51bWJlcjtcbiAgICBwYXRoOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBCYWNrdXBJbmZvIHtcbiAgICBzdGF0dXM6IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IHN0cmluZzsgLy8gSVNPIDg2MDEgc3RyaW5nXG4gICAgZGV0YWlsczogQmFja3VwUmVzdWx0W107XG59XG5cbmludGVyZmFjZSBEZWxldGVJc3N1ZVJlc3VsdCB7XG4gICAgZGVsZXRlZDogYm9vbGVhbjtcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG59XG5cblxuLyoqXG4gKiBPYnRpZW5lIHVuIGRhc2hib2FyZCBjb24gbcOpdHJpY2FzIGNsYXZlIGRlbCBzaXN0ZW1hXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxTeXN0ZW1EYXNoYm9hcmQ+fSBEYXNoYm9hcmQgY29uIG3DqXRyaWNhcyBkZWwgc2lzdGVtYVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3lzdGVtRGFzaGJvYXJkKCk6IFByb21pc2U8U3lzdGVtRGFzaGJvYXJkPiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gT2J0ZW5lbW9zIGNvbnRlb3MgZGUgZWxlbWVudG9zIGVuIGNhZGEgdWJpY2FjacOzblxuICAgICAgICBjb25zdCBbcGFja2luZ0VnZ3MsIGJvZGVnYUVnZ3MsIHZlbnRhRWdncywgcGFsbGV0cywgaXNzdWVzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGR5bmFtb0RCLnNjYW4oe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogRUdHX1RBQkxFLFxuICAgICAgICAgICAgICAgIEluZGV4TmFtZTogJ3ViaWNhY2lvbi1pbmRleCcsIC8vIEVuc3VyZSB0aGlzIGluZGV4IGV4aXN0cyBpbiBEeW5hbW9EQlxuICAgICAgICAgICAgICAgIEZpbHRlckV4cHJlc3Npb246ICd1YmljYWNpb24gPSA6bG9jYXRpb25WYWx1ZScsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogeyAnOmxvY2F0aW9uVmFsdWUnOiAnUEFDS0lORycgfSxcbiAgICAgICAgICAgICAgICBTZWxlY3Q6ICdDT1VOVCdcbiAgICAgICAgICAgIH0pLnByb21pc2UoKSxcblxuICAgICAgICAgICAgZHluYW1vREIuc2Nhbih7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBFR0dfVEFCTEUsXG4gICAgICAgICAgICAgICAgSW5kZXhOYW1lOiAndWJpY2FjaW9uLWluZGV4JywgLy8gRW5zdXJlIHRoaXMgaW5kZXggZXhpc3RzIGluIER5bmFtb0RCXG4gICAgICAgICAgICAgICAgRmlsdGVyRXhwcmVzc2lvbjogJ3ViaWNhY2lvbiA9IDpsb2NhdGlvblZhbHVlJyxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7ICc6bG9jYXRpb25WYWx1ZSc6ICdCT0RFR0EnIH0sXG4gICAgICAgICAgICAgICAgU2VsZWN0OiAnQ09VTlQnXG4gICAgICAgICAgICB9KS5wcm9taXNlKCksXG5cbiAgICAgICAgICAgIGR5bmFtb0RCLnNjYW4oe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogRUdHX1RBQkxFLFxuICAgICAgICAgICAgICAgIEluZGV4TmFtZTogJ3ViaWNhY2lvbi1pbmRleCcsIC8vIEVuc3VyZSB0aGlzIGluZGV4IGV4aXN0cyBpbiBEeW5hbW9EQlxuICAgICAgICAgICAgICAgIEZpbHRlckV4cHJlc3Npb246ICd1YmljYWNpb24gPSA6bG9jYXRpb25WYWx1ZScsXG4gICAgICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogeyAnOmxvY2F0aW9uVmFsdWUnOiAnVkVOVEEnIH0sXG4gICAgICAgICAgICAgICAgU2VsZWN0OiAnQ09VTlQnXG4gICAgICAgICAgICB9KS5wcm9taXNlKCksXG5cbiAgICAgICAgICAgIGR5bmFtb0RCLnNjYW4oe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogUEFMTEVUU19UQUJMRSxcbiAgICAgICAgICAgICAgICBTZWxlY3Q6ICdDT1VOVCdcbiAgICAgICAgICAgIH0pLnByb21pc2UoKSxcblxuICAgICAgICAgICAgZHluYW1vREIuc2Nhbih7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBJU1NVRVNfVEFCTEUsXG4gICAgICAgICAgICAgICAgU2VsZWN0OiAnQ09VTlQnXG4gICAgICAgICAgICB9KS5wcm9taXNlKClcbiAgICAgICAgXSk7XG5cbiAgICAgICAgLy8gT2J0ZW5lciBwYWxsZXQgYWN0aXZvXG4gICAgICAgIGNvbnN0IGFjdGl2ZVBhbGxldCA9IGF3YWl0IGdldFN5c3RlbUNvbmZpZygnQUNUSVZFX1BBTExFVF9DT0RFJyk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXRzOiB7XG4gICAgICAgICAgICAgICAgaHVldm9zX2VuX3BhY2tpbmc6IHBhY2tpbmdFZ2dzLkNvdW50IHx8IDAsXG4gICAgICAgICAgICAgICAgaHVldm9zX2VuX2JvZGVnYTogYm9kZWdhRWdncy5Db3VudCB8fCAwLFxuICAgICAgICAgICAgICAgIGh1ZXZvc19lbl92ZW50YTogdmVudGFFZ2dzLkNvdW50IHx8IDAsXG4gICAgICAgICAgICAgICAgdG90YWxfcGFsbGV0czogcGFsbGV0cy5Db3VudCB8fCAwLFxuICAgICAgICAgICAgICAgIGlzc3Vlc19wZW5kaWVudGVzOiBpc3N1ZXMuQ291bnQgfHwgMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHBhbGxldF9hY3Rpdm86IGFjdGl2ZVBhbGxldFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHsgLy8gVXNlICdhbnknIGZvciBicm9hZGVyIGNvbXBhdGliaWxpdHkgd2l0aCBlcnJvciB0eXBlc1xuICAgICAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgYWwgb2J0ZW5lciBkYXNoYm9hcmQgZGVsIHNpc3RlbWE6JywgZXJyb3IpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGFsIG9idGVuZXIgbcOpdHJpY2FzIGRlbCBzaXN0ZW1hOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxufVxuXG4vKipcbiAqIE9idGllbmUgbGEgbGlzdGEgZGUgcHJvYmxlbWFzIHJlcG9ydGFkb3MgY29uIG9wY2lvbmVzIGRlIGZpbHRyYWRvXG4gKiBAcGFyYW0ge0dldElzc3Vlc09wdGlvbnN9IG9wdGlvbnMgLSBPcGNpb25lcyBkZSBmaWx0cmFkbyAoZXN0YWRvLCBmZWNoYSlcbiAqIEByZXR1cm5zIHtQcm9taXNlPElzc3VlW10+fSBMaXN0YSBkZSBwcm9ibGVtYXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldElzc3VlcyhvcHRpb25zOiBHZXRJc3N1ZXNPcHRpb25zID0ge30pOiBQcm9taXNlPElzc3VlW10+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXJhbXM6IERvY3VtZW50Q2xpZW50LlNjYW5JbnB1dCA9IHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogSVNTVUVTX1RBQkxFXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU2kgaGF5IGZpbHRyb3MsIGxvcyBhw7FhZGltb3NcbiAgICAgICAgaWYgKG9wdGlvbnMuc3RhdHVzIHx8IG9wdGlvbnMuc3RhcnREYXRlIHx8IG9wdGlvbnMuZW5kRGF0ZSkge1xuICAgICAgICAgICAgbGV0IGZpbHRlckV4cHJlc3Npb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgY29uc3QgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogRG9jdW1lbnRDbGllbnQuRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlTWFwID0ge307XG4gICAgICAgICAgICBjb25zdCBleHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IERvY3VtZW50Q2xpZW50LkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lTWFwID0ge307XG5cblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgLy8gVXNlIGEgcGxhY2Vob2xkZXIgZm9yICdzdGF0dXMnIHNpbmNlIGl0J3MgYSByZXNlcnZlZCB3b3JkXG4gICAgICAgICAgICAgICAgZmlsdGVyRXhwcmVzc2lvbnMucHVzaCgnI3N0YXR1c0F0dHIgPSA6c3RhdHVzVmFsdWUnKTtcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlTmFtZXNbJyNzdGF0dXNBdHRyJ10gPSAnc3RhdHVzJztcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzWyc6c3RhdHVzVmFsdWUnXSA9IG9wdGlvbnMuc3RhdHVzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zdGFydERhdGUpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJFeHByZXNzaW9ucy5wdXNoKCd0aW1lc3RhbXAgPj0gOnN0YXJ0RGF0ZScpO1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzpzdGFydERhdGUnXSA9IG9wdGlvbnMuc3RhcnREYXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5lbmREYXRlKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyRXhwcmVzc2lvbnMucHVzaCgndGltZXN0YW1wIDw9IDplbmREYXRlJyk7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlc1snOmVuZERhdGUnXSA9IG9wdGlvbnMuZW5kRGF0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcGFyYW1zLkZpbHRlckV4cHJlc3Npb24gPSBmaWx0ZXJFeHByZXNzaW9ucy5qb2luKCcgQU5EICcpO1xuICAgICAgICAgICAgcGFyYW1zLkV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMgPSBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzO1xuICAgICAgICAgICAgcGFyYW1zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyA9IGV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLnNjYW4ocGFyYW1zKS5wcm9taXNlKCk7XG4gICAgICAgIHJldHVybiAocmVzdWx0Lkl0ZW1zIGFzIElzc3VlW10pIHx8IFtdO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHsgLy8gVXNlICdhbnknIGZvciBicm9hZGVyIGNvbXBhdGliaWxpdHkgd2l0aCBlcnJvciB0eXBlc1xuICAgICAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgYWwgb2J0ZW5lciBwcm9ibGVtYXMgcmVwb3J0YWRvczonLCBlcnJvcik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgYWwgb2J0ZW5lciBwcm9ibGVtYXM6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG59XG5cbi8qKlxuICogQWN0dWFsaXphIGVsIGVzdGFkbyBkZSB1biBwcm9ibGVtYSByZXBvcnRhZG9cbiAqIEBwYXJhbSB7c3RyaW5nfSBpc3N1ZUlkIC0gSUQgZGVsIHByb2JsZW1hXG4gKiBAcGFyYW0geydQRU5ESU5HJyB8ICdJTl9QUk9HUkVTUycgfCAnUkVTT0xWRUQnfSBzdGF0dXMgLSBOdWV2byBlc3RhZG9cbiAqIEBwYXJhbSB7c3RyaW5nIHwgbnVsbH0gcmVzb2x1dGlvbiAtIENvbWVudGFyaW8gZGUgcmVzb2x1Y2nDs24gKG9wY2lvbmFsKVxuICogQHJldHVybnMge1Byb21pc2U8SXNzdWUgfCB1bmRlZmluZWQ+fSBQcm9ibGVtYSBhY3R1YWxpemFkbywgb3IgdW5kZWZpbmVkIGlmIG5vdCBmb3VuZFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlSXNzdWVTdGF0dXMoaXNzdWVJZDogc3RyaW5nLCBzdGF0dXM6ICdQRU5ESU5HJyB8ICdJTl9QUk9HUkVTUycgfCAnUkVTT0xWRUQnLCByZXNvbHV0aW9uOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IFByb21pc2U8SXNzdWUgfCB1bmRlZmluZWQ+IHtcbiAgICB0cnkge1xuICAgICAgICBpZiAoIVsnUEVORElORycsICdJTl9QUk9HUkVTUycsICdSRVNPTFZFRCddLmluY2x1ZGVzKHN0YXR1cykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXN0YWRvIGludsOhbGlkby4gRGViZSBzZXIgUEVORElORywgSU5fUFJPR1JFU1MgbyBSRVNPTFZFRCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFyYW1zOiBEb2N1bWVudENsaWVudC5VcGRhdGVJdGVtSW5wdXQgPSB7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IElTU1VFU19UQUJMRSxcbiAgICAgICAgICAgIEtleTogeyBJc3N1ZU51bWJlcjogaXNzdWVJZCB9LFxuICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogJ1NFVCAjc3RhdHVzQXR0ciA9IDpzdGF0dXNWYWx1ZSwgbGFzdFVwZGF0ZWQgPSA6dGltZXN0YW1wJyxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge1xuICAgICAgICAgICAgICAgICcjc3RhdHVzQXR0cic6ICdzdGF0dXMnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgICAgICc6c3RhdHVzVmFsdWUnOiBzdGF0dXMsXG4gICAgICAgICAgICAgICAgJzp0aW1lc3RhbXAnOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZXR1cm5WYWx1ZXM6ICdBTExfTkVXJ1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNpIGhheSBjb21lbnRhcmlvIGRlIHJlc29sdWNpw7NuLCBsbyBhw7FhZGltb3NcbiAgICAgICAgaWYgKHJlc29sdXRpb24gIT09IG51bGwgJiYgc3RhdHVzID09PSAnUkVTT0xWRUQnKSB7XG4gICAgICAgICAgICBwYXJhbXMuVXBkYXRlRXhwcmVzc2lvbiArPSAnLCByZXNvbHV0aW9uID0gOnJlc29sdXRpb24nO1xuICAgICAgICAgICAgLy8gRW5zdXJlIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMgZXhpc3RzIGJlZm9yZSBhY2Nlc3NpbmcgaXRcbiAgICAgICAgICAgIGlmICghcGFyYW1zLkV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMuRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyYW1zLkV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXNbJzpyZXNvbHV0aW9uJ10gPSByZXNvbHV0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZHluYW1vREIudXBkYXRlKHBhcmFtcykucHJvbWlzZSgpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LkF0dHJpYnV0ZXMgYXMgSXNzdWUgfCB1bmRlZmluZWQ7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkgeyAvLyBVc2UgJ2FueScgZm9yIGJyb2FkZXIgY29tcGF0aWJpbGl0eSB3aXRoIGVycm9yIHR5cGVzXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciBhbCBhY3R1YWxpemFyIGVzdGFkbyBkZWwgcHJvYmxlbWEgJHtpc3N1ZUlkfTpgLCBlcnJvcik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgYWwgYWN0dWFsaXphciBlc3RhZG8gZGVsIHByb2JsZW1hOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxufVxuXG4vKipcbiAqIFJldmlzYSB5IGNvcnJpZ2UgaW5jb25zaXN0ZW5jaWFzIGVuIGxvcyBkYXRvc1xuICogQHJldHVybnMge1Byb21pc2U8QXVkaXRSZXN1bHRzPn0gUmVzdWx0YWRvIGRlIGxhIHZlcmlmaWNhY2nDs25cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGF1ZGl0QW5kRml4RGF0YSgpOiBQcm9taXNlPEF1ZGl0UmVzdWx0cz4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGlzc3VlczogQXVkaXRSZXN1bHRzWydpc3N1ZXMnXSA9IHtcbiAgICAgICAgICAgIGh1ZXZvc1NpblBhbGxldHM6IFtdLFxuICAgICAgICAgICAgcGFsbGV0c0ludmFsaWRvczogW10sXG4gICAgICAgICAgICBjb25maWdzSW52YWxpZGFzOiBbXVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBmaXhlczogQXVkaXRSZXN1bHRzWydmaXhlcyddID0ge1xuICAgICAgICAgICAgaHVldm9zQ29ycmVnaWRvczogMCxcbiAgICAgICAgICAgIHBhbGxldHNDb3JyZWdpZG9zOiAwLFxuICAgICAgICAgICAgY29uZmlnc0NvcnJlZ2lkYXM6IDBcbiAgICAgICAgfTtcblxuICAgICAgICAvLyAxLiBWZXJpZmljYXIgaHVldm9zIGNvbiByZWZlcmVuY2lhcyBhIHBhbGxldHMgaW5leGlzdGVudGVzXG4gICAgICAgIGNvbnN0IGh1ZXZvc1Jlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLnNjYW4oeyBUYWJsZU5hbWU6IEVHR19UQUJMRSB9KS5wcm9taXNlKCk7XG4gICAgICAgIGNvbnN0IGh1ZXZvczogRWdnW10gPSBodWV2b3NSZXN1bHQuSXRlbXMgYXMgRWdnW10gfHwgW107XG5cbiAgICAgICAgY29uc3QgcGFsbGV0c1Jlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLnNjYW4oeyBUYWJsZU5hbWU6IFBBTExFVFNfVEFCTEUgfSkucHJvbWlzZSgpO1xuICAgICAgICBjb25zdCBwYWxsZXRzOiBQYWxsZXRbXSA9IHBhbGxldHNSZXN1bHQuSXRlbXMgYXMgUGFsbGV0W10gfHwgW107XG5cbiAgICAgICAgLy8gVXNlICdjb2RpZ28nIGFzIHRoZSBwcmltYXJ5IGtleSBpZGVudGlmaWVyIGZvciBwYWxsZXRzXG4gICAgICAgIGNvbnN0IHBhbGxldElkcyA9IG5ldyBTZXQocGFsbGV0cy5tYXAocCA9PiBwLmNvZGlnbykpO1xuXG4gICAgICAgIGZvciAoY29uc3QgaHVldm8gb2YgaHVldm9zKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBwYWxsZXRJZCBleGlzdHMgYW5kIGlmIGl0IHJlZmVycyB0byBhIG5vbi1leGlzdGVudCBwYWxsZXQgdXNpbmcgJ2NvZGlnbydcbiAgICAgICAgICAgIGlmIChodWV2by5wYWxsZXRJZCAmJiAhcGFsbGV0SWRzLmhhcyhodWV2by5wYWxsZXRJZCkpIHtcbiAgICAgICAgICAgICAgICBpc3N1ZXMuaHVldm9zU2luUGFsbGV0cy5wdXNoKGh1ZXZvLmNvZGlnbyk7XG5cbiAgICAgICAgICAgICAgICAvLyBDb3JyZWdpciBlbGltaW5hbmRvIGxhIHJlZmVyZW5jaWEgYWwgcGFsbGV0XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZHluYW1vREIudXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogRUdHX1RBQkxFLFxuICAgICAgICAgICAgICAgICAgICAgICAgS2V5OiB7IGNvZGlnbzogaHVldm8uY29kaWdvIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiAnUkVNT1ZFIHBhbGxldElkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbmRpdGlvbkV4cHJlc3Npb246ICdhdHRyaWJ1dGVfZXhpc3RzKHBhbGxldElkKScsIC8vIEVuc3VyZSBwYWxsZXRJZCBleGlzdHMgYmVmb3JlIHJlbW92aW5nXG4gICAgICAgICAgICAgICAgICAgIH0pLnByb21pc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgZml4ZXMuaHVldm9zQ29ycmVnaWRvcysrO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHVwZGF0ZUVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBjYXNlcyB3aGVyZSB0aGUgaXRlbSBtaWdodCBoYXZlIGJlZW4gdXBkYXRlZCBjb25jdXJyZW50bHlcbiAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVFcnJvci5jb2RlID09PSAnQ29uZGl0aW9uYWxDaGVja0ZhaWxlZEV4Y2VwdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29uZGl0aW9uYWwgY2hlY2sgZmFpbGVkIGZvciBlZ2cgJHtodWV2by5jb2RpZ299LiBwYWxsZXRJZCBtaWdodCBoYXZlIGJlZW4gcmVtb3ZlZCBjb25jdXJyZW50bHkuYCk7XG4gICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgZml4aW5nIGh1ZXZvICR7aHVldm8uY29kaWdvfTpgLCB1cGRhdGVFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gMi4gVmVyaWZpY2FyIHBhbGxldHMgY29uIGluZm9ybWFjacOzbiBpbmNvbnNpc3RlbnRlXG4gICAgICAgIGZvciAoY29uc3QgcGFsbGV0IG9mIHBhbGxldHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkQm94Q291bnQgPSBwYWxsZXQuY2FqYXMgPyBwYWxsZXQuY2FqYXMubGVuZ3RoIDogMDtcblxuICAgICAgICAgICAgaWYgKHBhbGxldC5jYW50aWRhZENhamFzICE9PSBleHBlY3RlZEJveENvdW50KSB7XG4gICAgICAgICAgICAgICAgLy8gVXNlICdjb2RpZ28nIGZvciBpZGVudGlmeWluZyB0aGUgaW52YWxpZCBwYWxsZXRcbiAgICAgICAgICAgICAgICBpc3N1ZXMucGFsbGV0c0ludmFsaWRvcy5wdXNoKHBhbGxldC5jb2RpZ28pO1xuXG4gICAgICAgICAgICAgICAgLy8gQ29ycmVnaXIgbGEgY2FudGlkYWRcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EQi51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBQQUxMRVRTX1RBQkxFLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXNlICdjb2RpZ28nIGFzIHRoZSBrZXkgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgS2V5OiB7IGNvZGlnbzogcGFsbGV0LmNvZGlnbyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogJ1NFVCBjYW50aWRhZENhamFzID0gOmNvdW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHsgJzpjb3VudCc6IGV4cGVjdGVkQm94Q291bnQgfVxuICAgICAgICAgICAgICAgICAgICB9KS5wcm9taXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGZpeGVzLnBhbGxldHNDb3JyZWdpZG9zKys7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAodXBkYXRlRXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBmaXhpbmcgcGFsbGV0ICR7cGFsbGV0LmNvZGlnb306YCwgdXBkYXRlRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDMuIFZlcmlmaWNhciBjb25maWd1cmFjaW9uZXMgZGVsIHNpc3RlbWFcbiAgICAgICAgY29uc3QgY29uZmlnc1Jlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLnNjYW4oeyBUYWJsZU5hbWU6IENPTkZJR19UQUJMRSB9KS5wcm9taXNlKCk7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3M6IFN5c3RlbUNvbmZpZ0l0ZW1bXSA9IGNvbmZpZ3NSZXN1bHQuSXRlbXMgYXMgU3lzdGVtQ29uZmlnSXRlbVtdIHx8IFtdO1xuXG4gICAgICAgIGNvbnN0IGFjdGl2ZVBhbGxldENvbmZpZyA9IGNvbmZpZ3MuZmluZChjID0+IGMuY29uZmlnS2V5ID09PSAnQUNUSVZFX1BBTExFVF9DT0RFJyk7XG4gICAgICAgIGNvbnN0IGFjdGl2ZVBhbGxldENvZGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGFjdGl2ZVBhbGxldENvbmZpZz8uY29uZmlnVmFsdWU7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGFjdGl2ZSBwYWxsZXQgY29kZSBleGlzdHMgYW5kIGlmIGl0IHJlZmVycyB0byBhIG5vbi1leGlzdGVudCBwYWxsZXQgdXNpbmcgJ2NvZGlnbydcbiAgICAgICAgaWYgKGFjdGl2ZVBhbGxldENvZGUgJiYgIXBhbGxldElkcy5oYXMoYWN0aXZlUGFsbGV0Q29kZSkpIHtcbiAgICAgICAgICAgIGlzc3Vlcy5jb25maWdzSW52YWxpZGFzLnB1c2goJ0FDVElWRV9QQUxMRVRfQ09ERScpO1xuXG4gICAgICAgICAgICAvLyBDb3JyZWdpciBlbGltaW5hbmRvIGxhIHJlZmVyZW5jaWEgYWwgcGFsbGV0IGFjdGl2b1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzZXRTeXN0ZW1Db25maWcoJ0FDVElWRV9QQUxMRVRfQ09ERScsIG51bGwpO1xuICAgICAgICAgICAgICAgIGZpeGVzLmNvbmZpZ3NDb3JyZWdpZGFzKys7XG4gICAgICAgICAgICB9IGNhdGNoIChzZXRFcnJvcjogYW55KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgZml4aW5nIHN5c3RlbSBjb25maWcgQUNUSVZFX1BBTExFVF9DT0RFOmAsIHNldEVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlZ2lzdHJvIGRlIGxhIGF1ZGl0b3LDrWFcbiAgICAgICAgY29uc3QgYWRtaW5Mb2c6IEFkbWluTG9nSXRlbSA9IHtcbiAgICAgICAgICAgIG9wZXJhY2lvbjogJ0FVRElUX0FORF9GSVgnLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBpc3N1ZXM6IGlzc3VlcywgLy8gTG9nIHRoZSBmb3VuZCBpc3N1ZXNcbiAgICAgICAgICAgIGZpeGVzOiBmaXhlcyAvLyBMb2cgdGhlIGFwcGxpZWQgZml4ZXNcbiAgICAgICAgfTtcblxuICAgICAgICBhd2FpdCBkeW5hbW9EQi5wdXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBBRE1JTl9MT0dTX1RBQkxFLFxuICAgICAgICAgICAgSXRlbTogYWRtaW5Mb2dcbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIHJldHVybiB7IGlzc3VlcywgZml4ZXMgfTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7IC8vIFVzZSAnYW55JyBmb3IgYnJvYWRlciBjb21wYXRpYmlsaXR5IHdpdGggZXJyb3IgdHlwZXNcbiAgICAgICAgY29uc29sZS5lcnJvcign4p2MIEVycm9yIGR1cmFudGUgbGEgYXVkaXRvcsOtYSB5IGNvcnJlY2Npw7NuIGRlIGRhdG9zOicsIGVycm9yKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBkdXJhbnRlIGxhIGF1ZGl0b3LDrWE6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmVzcGFsZGEgbG9zIGRhdG9zIGRlIGxhIGFwbGljYWNpw7NuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxCYWNrdXBJbmZvPn0gSW5mb3JtYWNpw7NuIHNvYnJlIGVsIHJlc3BhbGRvXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBiYWNrdXBEYXRhKCk6IFByb21pc2U8QmFja3VwSW5mbz4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOi5dL2csICctJyk7XG4gICAgICAgIGNvbnN0IHMzID0gbmV3IEFXUy5TMygpO1xuICAgICAgICAvLyBVc2UgYSBkZWZhdWx0IGJ1Y2tldCBuYW1lIGlmIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0XG4gICAgICAgIGNvbnN0IGJhY2t1cEJ1Y2tldCA9IHByb2Nlc3MuZW52LkJBQ0tVUF9CVUNLRVQgfHwgJ2h1ZXZvcy1hcHAtYmFja3Vwcy1kZWZhdWx0JzsgLy8gQ29uc2lkZXIgYSBtb3JlIHJvYnVzdCBuYW1pbmcgY29udmVudGlvbiBvciBjb25maWd1cmF0aW9uXG5cbiAgICAgICAgLy8gRXhlY3V0ZSBleHBvcnRzIGZvciBlYWNoIHRhYmxlXG4gICAgICAgIGNvbnN0IHRhYmxlc1RvQmFja3VwOiBzdHJpbmdbXSA9IFtFR0dfVEFCTEUsIFBBTExFVFNfVEFCTEUsIElTU1VFU19UQUJMRSwgQ09ORklHX1RBQkxFLCBBRE1JTl9MT0dTX1RBQkxFXTsgLy8gSW5jbHVkZSBBZG1pbkxvZ3MgdGFibGUgaW4gYmFja3VwXG4gICAgICAgIGNvbnN0IGJhY2t1cFJlc3VsdHM6IEJhY2t1cFJlc3VsdFtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCB0YWJsZSBvZiB0YWJsZXNUb0JhY2t1cCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgYWxsIGRhdGEgZnJvbSB0aGUgdGFibGUgKGhhbmRsZSBsYXJnZSB0YWJsZXMgd2l0aCBwYWdpbmF0aW9uIGlmIG5lY2Vzc2FyeSlcbiAgICAgICAgICAgICAgICBjb25zdCBzY2FuUGFyYW1zOiBEb2N1bWVudENsaWVudC5TY2FuSW5wdXQgPSB7IFRhYmxlTmFtZTogdGFibGUgfTtcbiAgICAgICAgICAgICAgICBsZXQgYWxsSXRlbXM6IERvY3VtZW50Q2xpZW50Lkl0ZW1MaXN0ID0gW107XG4gICAgICAgICAgICAgICAgbGV0IGxhc3RFdmFsdWF0ZWRLZXk6IERvY3VtZW50Q2xpZW50LktleSB8IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YTogRG9jdW1lbnRDbGllbnQuU2Nhbk91dHB1dCA9IGF3YWl0IGR5bmFtb0RCLnNjYW4oc2NhblBhcmFtcykucHJvbWlzZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5JdGVtcykge1xuICAgICAgICAgICAgICAgICAgICAgICBhbGxJdGVtcyA9IGFsbEl0ZW1zLmNvbmNhdChkYXRhLkl0ZW1zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0RXZhbHVhdGVkS2V5ID0gZGF0YS5MYXN0RXZhbHVhdGVkS2V5O1xuICAgICAgICAgICAgICAgICAgICBzY2FuUGFyYW1zLkV4Y2x1c2l2ZVN0YXJ0S2V5ID0gbGFzdEV2YWx1YXRlZEtleTtcbiAgICAgICAgICAgICAgICB9IHdoaWxlIChsYXN0RXZhbHVhdGVkS2V5KTtcblxuXG4gICAgICAgICAgICAgICAgLy8gU2F2ZSB0byBTM1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGBiYWNrdXAvJHt0aW1lc3RhbXB9LyR7dGFibGV9Lmpzb25gO1xuXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIHRoZSBidWNrZXQgZXhpc3RzIGJlZm9yZSBwdXR0aW5nIHRoZSBvYmplY3QgKG9wdGlvbmFsLCBidXQgZ29vZCBwcmFjdGljZSlcbiAgICAgICAgICAgICAgICAvLyB0cnkge1xuICAgICAgICAgICAgICAgIC8vICAgICBhd2FpdCBzMy5oZWFkQnVja2V0KHsgQnVja2V0OiBiYWNrdXBCdWNrZXQgfSkucHJvbWlzZSgpO1xuICAgICAgICAgICAgICAgIC8vIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICBpZiAoZXJyLmNvZGUgPT09ICdOb3RGb3VuZCcpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAvLyBCdWNrZXQgZG9lcyBub3QgZXhpc3QsIGNyZWF0ZSBpdCAoY29uc2lkZXIgcmVnaW9uIGFuZCBwZXJtaXNzaW9ucylcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICBhd2FpdCBzMy5jcmVhdGVCdWNrZXQoeyBCdWNrZXQ6IGJhY2t1cEJ1Y2tldCB9KS5wcm9taXNlKCk7XG4gICAgICAgICAgICAgICAgLy8gICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgIHRocm93IGVycjsgLy8gUmUtdGhyb3cgb3RoZXIgZXJyb3JzXG4gICAgICAgICAgICAgICAgLy8gICAgICB9XG4gICAgICAgICAgICAgICAgLy8gfVxuXG5cbiAgICAgICAgICAgICAgICBhd2FpdCBzMy5wdXRPYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBCdWNrZXQ6IGJhY2t1cEJ1Y2tldCxcbiAgICAgICAgICAgICAgICAgICAgS2V5OiBrZXksXG4gICAgICAgICAgICAgICAgICAgIEJvZHk6IEpTT04uc3RyaW5naWZ5KGFsbEl0ZW1zKSxcbiAgICAgICAgICAgICAgICAgICAgQ29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgICAgIH0pLnByb21pc2UoKTtcblxuICAgICAgICAgICAgICAgIGJhY2t1cFJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlLFxuICAgICAgICAgICAgICAgICAgICByZWNvcmRzOiBhbGxJdGVtcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGBzMzovLyR7YmFja3VwQnVja2V0fS8ke2tleX1gXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUgQmFja2VkIHVwICR7dGFibGV9IHdpdGggJHthbGxJdGVtcy5sZW5ndGh9IHJlY29yZHMgdG8gczM6Ly8ke2JhY2t1cEJ1Y2tldH0vJHtrZXl9YCk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKHRhYmxlRXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgYmFja2luZyB1cCB0YWJsZSAke3RhYmxlfTpgLCB0YWJsZUVycm9yKTtcbiAgICAgICAgICAgICAgICAgLy8gT3B0aW9uYWxseSBjb250aW51ZSB3aXRoIG90aGVyIHRhYmxlcyBvciB0aHJvdyBpbW1lZGlhdGVseVxuICAgICAgICAgICAgICAgICBiYWNrdXBSZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgdGFibGUsXG4gICAgICAgICAgICAgICAgICAgICByZWNvcmRzOiAwLFxuICAgICAgICAgICAgICAgICAgICAgcGF0aDogYEVycm9yOiAke3RhYmxlRXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVnaXN0ZXIgdGhlIGJhY2t1cFxuICAgICAgICBjb25zdCBiYWNrdXBMb2c6IEFkbWluTG9nSXRlbSA9IHtcbiAgICAgICAgICAgIG9wZXJhY2lvbjogJ0JBQ0tVUCcsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIHRhYmxlczogYmFja3VwUmVzdWx0cyAvLyBMb2cgdGhlIHJlc3VsdHMgZm9yIGVhY2ggdGFibGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBdHRlbXB0IHRvIGxvZyB0aGUgYmFja3VwIHJlc3VsdCwgZXZlbiBpZiBzb21lIHRhYmxlcyBmYWlsZWRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGR5bmFtb0RCLnB1dCh7XG4gICAgICAgICAgICAgICAgVGFibGVOYW1lOiBBRE1JTl9MT0dTX1RBQkxFLFxuICAgICAgICAgICAgICAgIEl0ZW06IGJhY2t1cExvZ1xuICAgICAgICAgICAgfSkucHJvbWlzZSgpO1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUgQmFja3VwIG9wZXJhdGlvbiBsb2dnZWQgdG8gJHtBRE1JTl9MT0dTX1RBQkxFfWApO1xuICAgICAgICB9IGNhdGNoIChsb2dFcnJvcjogYW55KSB7XG4gICAgICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yIGxvZ2dpbmcgYmFja3VwIG9wZXJhdGlvbiB0byAke0FETUlOX0xPR1NfVEFCTEV9OmAsIGxvZ0Vycm9yKTtcbiAgICAgICAgICAgICAvLyBEZWNpZGUgaG93IHRvIGhhbmRsZSBsb2dnaW5nIGZhaWx1cmUgKHRocm93IG9yIGp1c3Qgd2FybilcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgYWxsIHRhYmxlcyB3ZXJlIHN1Y2Nlc3NmdWxseSBiYWNrZWQgdXBcbiAgICAgICAgY29uc3QgYWxsVGFibGVzQmFja2VkVXAgPSB0YWJsZXNUb0JhY2t1cC5ldmVyeSh0YWJsZSA9PiBiYWNrdXBSZXN1bHRzLnNvbWUocmVzID0+IHJlcy50YWJsZSA9PT0gdGFibGUgJiYgIXJlcy5wYXRoLnN0YXJ0c1dpdGgoJ0Vycm9yOicpKSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1czogYWxsVGFibGVzQmFja2VkVXAgPyAnc3VjY2VzcycgOiAncGFydGlhbF9zdWNjZXNzJyxcbiAgICAgICAgICAgIHRpbWVzdGFtcCxcbiAgICAgICAgICAgIGRldGFpbHM6IGJhY2t1cFJlc3VsdHNcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7IC8vIFVzZSAnYW55JyBmb3IgYnJvYWRlciBjb21wYXRpYmlsaXR5IHdpdGggZXJyb3IgdHlwZXNcbiAgICAgICAgY29uc29sZS5lcnJvcign4p2MIEVycm9yIGR1cmFudGUgZWwgcmVzcGFsZG8gZGUgZGF0b3M6JywgZXJyb3IpO1xuICAgICAgICAvLyBMb2cgYSBmYWlsZWQgYmFja3VwIGF0dGVtcHRcbiAgICAgICAgY29uc3QgZmFpbGVkQmFja3VwTG9nOiBBZG1pbkxvZ0l0ZW0gPSB7XG4gICAgICAgICAgICAgb3BlcmFjaW9uOiAnQkFDS1VQX0ZBSUxFRCcsXG4gICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlXG4gICAgICAgIH07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgYXdhaXQgZHluYW1vREIucHV0KHsgVGFibGVOYW1lOiBBRE1JTl9MT0dTX1RBQkxFLCBJdGVtOiBmYWlsZWRCYWNrdXBMb2cgfSkucHJvbWlzZSgpO1xuICAgICAgICB9IGNhdGNoIChsb2dFcnJvcjogYW55KSB7XG4gICAgICAgICAgICAgY29uc29sZS5lcnJvcign4p2MIEZhaWxlZCB0byBsb2cgZmFpbGVkIGJhY2t1cCBvcGVyYXRpb246JywgbG9nRXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBhbCByZXNwYWxkYXIgZGF0b3M6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG59XG5cbi8qKlxuICogRWxpbWluYSB1biBpc3N1ZSBkZSBsYSBiYXNlIGRlIGRhdG9zXG4gKiBAcGFyYW0ge3N0cmluZ30gaXNzdWVJZCAtIElEIGRlbCBpc3N1ZSBhIGVsaW1pbmFyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxEZWxldGVJc3N1ZVJlc3VsdD59IFJlc3VsdGFkbyBkZSBsYSBvcGVyYWNpw7NuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVJc3N1ZShpc3N1ZUlkOiBzdHJpbmcpOiBQcm9taXNlPERlbGV0ZUlzc3VlUmVzdWx0PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKCFpc3N1ZUlkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lEIGRlIGluY2lkZW5jaWEgZXMgcmVxdWVyaWRvJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWZXJpZmljYXIgc2kgZWwgaXNzdWUgZXhpc3RlXG4gICAgICAgIGNvbnN0IGdldFBhcmFtczogRG9jdW1lbnRDbGllbnQuR2V0SXRlbUlucHV0ID0ge1xuICAgICAgICAgICAgVGFibGVOYW1lOiBJU1NVRVNfVEFCTEUsXG4gICAgICAgICAgICBLZXk6IHsgSXNzdWVOdW1iZXI6IGlzc3VlSWQgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSXNzdWUgPSBhd2FpdCBkeW5hbW9EQi5nZXQoZ2V0UGFyYW1zKS5wcm9taXNlKCk7XG5cbiAgICAgICAgaWYgKCFleGlzdGluZ0lzc3VlLkl0ZW0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gc2UgZW5jb250csOzIGxhIGluY2lkZW5jaWEgY29uIElEOiAke2lzc3VlSWR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbGltaW5hciBlbCBpc3N1ZVxuICAgICAgICBjb25zdCBkZWxldGVQYXJhbXM6IERvY3VtZW50Q2xpZW50LkRlbGV0ZUl0ZW1JbnB1dCA9IHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogSVNTVUVTX1RBQkxFLFxuICAgICAgICAgICAgS2V5OiB7IElzc3VlTnVtYmVyOiBpc3N1ZUlkIH0sXG4gICAgICAgICAgICBSZXR1cm5WYWx1ZXM6ICdBTExfT0xEJyAvLyBSZXR1cm4gdGhlIGl0ZW0gdGhhdCB3YXMgZGVsZXRlZFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLmRlbGV0ZShkZWxldGVQYXJhbXMpLnByb21pc2UoKTtcbiAgICAgICAgY29uc3QgZGVsZXRlZEl0ZW0gPSByZXN1bHQuQXR0cmlidXRlczsgLy8gVGhpcyB3aWxsIGJlIHRoZSBkZWxldGVkIGl0ZW0gb3IgdW5kZWZpbmVkIGlmIGl0IGRpZG4ndCBleGlzdFxuXG4gICAgICAgIC8vIFJlZ2lzdGVyIHRoZSBvcGVyYXRpb25cbiAgICAgICAgY29uc3QgYWRtaW5Mb2c6IEFkbWluTG9nSXRlbSA9IHtcbiAgICAgICAgICAgIG9wZXJhY2lvbjogJ0RFTEVURV9JU1NVRScsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIGlzc3VlSWQ6IGlzc3VlSWQsXG4gICAgICAgICAgICBkZWxldGVkSXRlbTogZGVsZXRlZEl0ZW0sIC8vIExvZyB0aGUgYWN0dWFsIGl0ZW0gZGVsZXRlZFxuICAgICAgICAgICAgdXN1YXJpbzogJ0FETUlOJyAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIGdldCBmcm9tIGF1dGhlbnRpY2F0aW9uIGNvbnRleHRcbiAgICAgICAgfTtcblxuICAgICAgICBhd2FpdCBkeW5hbW9EQi5wdXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBBRE1JTl9MT0dTX1RBQkxFLFxuICAgICAgICAgICAgSXRlbTogYWRtaW5Mb2dcbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZWxldGVkOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogYExhIGluY2lkZW5jaWEgJHtpc3N1ZUlkfSBmdWUgZWxpbWluYWRhIGNvcnJlY3RhbWVudGVgXG4gICAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkgeyAvLyBVc2UgJ2FueScgZm9yIGJyb2FkZXIgY29tcGF0aWJpbGl0eSB3aXRoIGVycm9yIHR5cGVzXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciBhbCBlbGltaW5hciBsYSBpbmNpZGVuY2lhICR7aXNzdWVJZH06YCwgZXJyb3IpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGFsIGVsaW1pbmFyIGluY2lkZW5jaWE6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG59XG5cbi8vIEV4cG9ydCBmdW5jdGlvbnMgZm9yIGV4dGVybmFsIHVzZVxuLy8gVXNpbmcgbmFtZWQgZXhwb3J0c1xuLy8gZXhwb3J0IHsgZ2V0U3lzdGVtRGFzaGJvYXJkLCBnZXRJc3N1ZXMsIHVwZGF0ZUlzc3VlU3RhdHVzLCBhdWRpdEFuZEZpeERhdGEsIGJhY2t1cERhdGEsIGRlbGV0ZUlzc3VlIH07Il19