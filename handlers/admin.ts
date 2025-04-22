/**
 * Admin functions for high-level system management
 */
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
// Assuming systemConfig and utils/response are also converted to TypeScript
import { getSystemConfig, setSystemConfig } from '../controllers/admin/system';
// import createApiResponse from '../utils/response'; // Import if needed, but not used in these functions

// Configure AWS if not already configured
// AWS.config.update({ region: "your-region" }); // Uncomment and set your region if needed

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Table Names
const ADMIN_LOGS_TABLE: string = 'AdminLogs';
const ISSUES_TABLE: string = 'Issues';
const EGG_TABLE: string = 'Huevos';
const PALLETS_TABLE: string = 'Pallets';
const CONFIG_TABLE: string = 'SystemConfig';

// Interface Definitions

interface Egg {
    codigo: string;
    ubicacion: 'PACKING' | 'BODEGA' | 'VENTA' | string; // Add other locations if applicable
    palletId?: string; // Optional reference to a pallet
    // Add other egg properties if known
}

interface Pallet {
    codigo: string;
    id?: string; // 'id' or 'codigo' seems to be used as primary key
    estado: 'open' | 'closed' | string; // Assuming estado can be other strings
    cantidadCajas: number;
    cajas?: string[]; // Array of box codes
    // Add other pallet properties if known
}

interface Issue {
    IssueNumber: string; // Primary key
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | string;
    timestamp: string; // ISO 8601 string
    lastUpdated?: string; // ISO 8601 string
    resolution?: string; // Comment for resolution
    // Add other issue properties if known (e.g., description, reportedBy, etc.)
}

interface SystemConfigItem {
    configKey: string; // Primary key
    configValue: any; // Value can be of various types
    // Add other config properties if known
}

interface AdminLogItem {
    operacion: string;
    timestamp: string; // ISO 8601 string
    issues?: any; // Details about issues found/fixed
    fixes?: any; // Details about fixes applied
    tables?: BackupResult[]; // Details about backup tables
    issueId?: string; // For delete operations
    deletedItem?: any; // Details of the item deleted
    usuario?: string; // User performing the operation (if applicable)
    details?: any; // Added for error messages
    errorMessage?: string; // Added for error messages
    // Add other log properties
}

interface GetIssuesOptions {
    status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | string;
    startDate?: string; // ISO 8601 string
    endDate?: string; // ISO 8601 string
}

interface SystemDashboard {
    stats: {
        huevos_en_packing: number;
        huevos_en_bodega: number;
        huevos_en_venta: number;
        total_pallets: number;
        issues_pendientes: number;
    };
    config: {
        pallet_activo: any; // Type depends on what ACTIVE_PALLET_CODE stores
    };
}

interface AuditResults {
    issues: {
        huevosSinPallets: string[];
        palletsInvalidos: string[];
        configsInvalidas: string[];
    };
    fixes: {
        huevosCorregidos: number;
        palletsCorregidos: number;
        configsCorregidas: number;
    };
}

interface BackupResult {
    table: string;
    records: number;
    path: string;
}

interface BackupInfo {
    status: string;
    timestamp: string; // ISO 8601 string
    details: BackupResult[];
}

interface DeleteIssueResult {
    deleted: boolean;
    message: string;
}


/**
 * Obtiene un dashboard con métricas clave del sistema
 * @returns {Promise<SystemDashboard>} Dashboard con métricas del sistema
 */
export async function getSystemDashboard(): Promise<SystemDashboard> {
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
        const activePallet = await getSystemConfig('ACTIVE_PALLET_CODE');

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
    } catch (error: any) { // Use 'any' for broader compatibility with error types
        console.error('❌ Error al obtener dashboard del sistema:', error);
        throw new Error(`Error al obtener métricas del sistema: ${error.message}`);
    }
}

/**
 * Obtiene la lista de problemas reportados con opciones de filtrado
 * @param {GetIssuesOptions} options - Opciones de filtrado (estado, fecha)
 * @returns {Promise<Issue[]>} Lista de problemas
 */
export async function getIssues(options: GetIssuesOptions = {}): Promise<Issue[]> {
    try {
        const params: DocumentClient.ScanInput = {
            TableName: ISSUES_TABLE
        };

        // Si hay filtros, los añadimos
        if (options.status || options.startDate || options.endDate) {
            let filterExpressions: string[] = [];
            const expressionAttributeValues: DocumentClient.ExpressionAttributeValueMap = {};
            const expressionAttributeNames: DocumentClient.ExpressionAttributeNameMap = {};


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
        return (result.Items as Issue[]) || [];
    } catch (error: any) { // Use 'any' for broader compatibility with error types
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
export async function updateIssueStatus(issueId: string, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED', resolution: string | null = null): Promise<Issue | undefined> {
    try {
        if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
            throw new Error('Estado inválido. Debe ser PENDING, IN_PROGRESS o RESOLVED');
        }

        const params: DocumentClient.UpdateItemInput = {
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
        return result.Attributes as Issue | undefined;
    } catch (error: any) { // Use 'any' for broader compatibility with error types
        console.error(`❌ Error al actualizar estado del problema ${issueId}:`, error);
        throw new Error(`Error al actualizar estado del problema: ${error.message}`);
    }
}

/**
 * Revisa y corrige inconsistencias en los datos
 * @returns {Promise<AuditResults>} Resultado de la verificación
 */
export async function auditAndFixData(): Promise<AuditResults> {
    try {
        const issues: AuditResults['issues'] = {
            huevosSinPallets: [],
            palletsInvalidos: [],
            configsInvalidas: []
        };
        const fixes: AuditResults['fixes'] = {
            huevosCorregidos: 0,
            palletsCorregidos: 0,
            configsCorregidas: 0
        };

        // 1. Verificar huevos con referencias a pallets inexistentes
        const huevosResult = await dynamoDB.scan({ TableName: EGG_TABLE }).promise();
        const huevos: Egg[] = huevosResult.Items as Egg[] || [];

        const palletsResult = await dynamoDB.scan({ TableName: PALLETS_TABLE }).promise();
        const pallets: Pallet[] = palletsResult.Items as Pallet[] || [];

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
                } catch (updateError: any) {
                     // Handle cases where the item might have been updated concurrently
                     if (updateError.code === 'ConditionalCheckFailedException') {
                        console.warn(`Conditional check failed for egg ${huevo.codigo}. palletId might have been removed concurrently.`);
                     } else {
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
                } catch (updateError: any) {
                    console.error(`Error fixing pallet ${pallet.codigo}:`, updateError);
                }
            }
        }

        // 3. Verificar configuraciones del sistema
        const configsResult = await dynamoDB.scan({ TableName: CONFIG_TABLE }).promise();
        const configs: SystemConfigItem[] = configsResult.Items as SystemConfigItem[] || [];

        const activePalletConfig = configs.find(c => c.configKey === 'ACTIVE_PALLET_CODE');
        const activePalletCode: string | undefined = activePalletConfig?.configValue;

        // Check if the active pallet code exists and if it refers to a non-existent pallet using 'codigo'
        if (activePalletCode && !palletIds.has(activePalletCode)) {
            issues.configsInvalidas.push('ACTIVE_PALLET_CODE');

            // Corregir eliminando la referencia al pallet activo
            try {
                await setSystemConfig('ACTIVE_PALLET_CODE', null);
                fixes.configsCorregidas++;
            } catch (setError: any) {
                console.error(`Error fixing system config ACTIVE_PALLET_CODE:`, setError);
            }
        }

        // Registro de la auditoría
        const adminLog: AdminLogItem = {
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
    } catch (error: any) { // Use 'any' for broader compatibility with error types
        console.error('❌ Error durante la auditoría y corrección de datos:', error);
        throw new Error(`Error durante la auditoría: ${error.message}`);
    }
}

/**
 * Respalda los datos de la aplicación
 * @returns {Promise<BackupInfo>} Información sobre el respaldo
 */
export async function backupData(): Promise<BackupInfo> {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const s3 = new AWS.S3();
        // Use a default bucket name if the environment variable is not set
        const backupBucket = process.env.BACKUP_BUCKET || 'huevos-app-backups-default'; // Consider a more robust naming convention or configuration

        // Execute exports for each table
        const tablesToBackup: string[] = [EGG_TABLE, PALLETS_TABLE, ISSUES_TABLE, CONFIG_TABLE, ADMIN_LOGS_TABLE]; // Include AdminLogs table in backup
        const backupResults: BackupResult[] = [];

        for (const table of tablesToBackup) {
            try {
                // Get all data from the table (handle large tables with pagination if necessary)
                const scanParams: DocumentClient.ScanInput = { TableName: table };
                let allItems: DocumentClient.ItemList = [];
                let lastEvaluatedKey: DocumentClient.Key | undefined;

                do {
                    const data: DocumentClient.ScanOutput = await dynamoDB.scan(scanParams).promise();
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

            } catch (tableError: any) {
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
        const backupLog: AdminLogItem = {
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
        } catch (logError: any) {
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
    } catch (error: any) { // Use 'any' for broader compatibility with error types
        console.error('❌ Error durante el respaldo de datos:', error);
        // Log a failed backup attempt
        const failedBackupLog: AdminLogItem = {
             operacion: 'BACKUP_FAILED',
             timestamp: new Date().toISOString(),
             errorMessage: error.message
        };
        try {
             await dynamoDB.put({ TableName: ADMIN_LOGS_TABLE, Item: failedBackupLog }).promise();
        } catch (logError: any) {
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
export async function deleteIssue(issueId: string): Promise<DeleteIssueResult> {
    try {
        if (!issueId) {
            throw new Error('ID de incidencia es requerido');
        }

        // Verificar si el issue existe
        const getParams: DocumentClient.GetItemInput = {
            TableName: ISSUES_TABLE,
            Key: { IssueNumber: issueId }
        };

        const existingIssue = await dynamoDB.get(getParams).promise();

        if (!existingIssue.Item) {
            throw new Error(`No se encontró la incidencia con ID: ${issueId}`);
        }

        // Eliminar el issue
        const deleteParams: DocumentClient.DeleteItemInput = {
            TableName: ISSUES_TABLE,
            Key: { IssueNumber: issueId },
            ReturnValues: 'ALL_OLD' // Return the item that was deleted
        };

        const result = await dynamoDB.delete(deleteParams).promise();
        const deletedItem = result.Attributes; // This will be the deleted item or undefined if it didn't exist

        // Register the operation
        const adminLog: AdminLogItem = {
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
    } catch (error: any) { // Use 'any' for broader compatibility with error types
        console.error(`❌ Error al eliminar la incidencia ${issueId}:`, error);
        throw new Error(`Error al eliminar incidencia: ${error.message}`);
    }
}

// Export functions for external use
// Using named exports
// export { getSystemDashboard, getIssues, updateIssueStatus, auditAndFixData, backupData, deleteIssue };