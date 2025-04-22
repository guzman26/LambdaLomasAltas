/**
 * Admin functions for high-level system management
 */
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// Assuming these modules are also converted to TypeScript and export types or classes
import SystemConfigModel from '../../models/SystemConfig'; // Assuming default export or adjust import
import BoxModel from '../../models/Box'; // Assuming default export or adjust import
import PalletModel from '../../models/Pallet'; // Assuming default export or adjust import
import IssueModel from '../../models/Issue'; // Assuming default export or adjust import
import dbUtils from '../../utils/db'; // Correct import for dbUtils
import createApiResponse from '../../utils/response'; // Assuming default export or adjust import
import { ApiResponse } from '../../types'; // Correct import for ApiResponse

// Configure AWS if not already configured
// AWS.config.update({ region: "your-region" }); // Uncomment and set your region if needed

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Define types based on expected data structures from models and dbUtils
interface SystemConfigItem {
  configKey: string; // Partition Key
  configValue: any; // Can be string, number, boolean, object, array, null etc.
  updatedAt?: string; // ISO 8601 string
}

interface BoxItem {
  codigo: string; // Partition Key
  palletId?: string; // Optional reference to a pallet
  // Add other box properties if known
}

interface PalletItem {
  codigo: string; // Assuming 'codigo' is the primary key for pallets
  id?: string; // Sometimes 'id' might be used, confirming 'codigo' based on usage
  cantidadCajas: number;
  cajas?: string[]; // Array of box codes
  // Add other pallet properties if known
}

interface AdminLogItem {
  operacion: string; // Partition Key (or part of a composite key)
  timestamp: string; // Sort Key (or part of a composite key)
  issues?: any; // Details about issues found/fixed
  fixes?: any; // Details about fixes applied
  tables?: BackupResult[]; // Details about backup tables
  usuario?: string; // User performing the operation (if applicable)
  details?: any; // Added for backing up operations
  issueId?: string; // Added for delete operations
  deletedItem?: any; // Added for delete operations
  // Add other log properties
}

interface AuditIssues {
  huevosSinPallets: string[];
  palletsInvalidos: string[];
  configsInvalidas: string[];
}

interface AuditFixes {
  huevosCorregidos: number;
  palletsCorregidos: number;
  configsCorregidas: number;
}

interface AuditResults {
  issues: AuditIssues;
  fixes: AuditFixes;
}

interface BackupResult {
  table: string;
  records: number;
  path: string;
}

interface BackupInfoPayload {
  status: 'success' | 'partial_success' | 'failed';
  timestamp: string; // ISO 8601 string
  details: BackupResult[];
}


/**
 * Get system configuration
 * @param {string} configKey - Configuration key
 * @returns {Promise<any | null>} Configuration value, or null if not found
 */
export async function getSystemConfig(configKey: string): Promise<any | null> {
  try {
    const params: DocumentClient.GetItemInput = {
      TableName: SystemConfigModel.getConfigTable(),
      Key: { configKey }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item ? (result.Item as SystemConfigItem).configValue : null;
  } catch (error: any) { // Use 'any' for broader compatibility with error types
    console.error(`❌ Error getting system config ${configKey}:`, error);
    throw new Error(`Error getting system config: ${error.message}`);
  }
}

/**
 * Set system configuration
 * @param {string} configKey - Configuration key
 * @param {any | null} configValue - Configuration value (use null to effectively remove/unset if your logic supports it)
 * @returns {Promise<{ configKey: string, configValue: any | null }>} Result
 */
export async function setSystemConfig(configKey: string, configValue: any | null): Promise<{ configKey: string, configValue: any | null }> {
  try {
    // DynamoDB PutItem does not support null for Item properties directly unless using Delete on Update
    // A common pattern is to store null values as a specific indicator like 'NULL_VALUE_MARKER' or just omit the attribute.
    // Given the original JS sets null, let's assume the model/dbUtils handles this or we just put it.
    // If setting to null means deleting the item, the logic needs to be adjusted. Assuming it means storing 'null'.
    const item: SystemConfigItem = {
      configKey: configKey,
      configValue: configValue, // DynamoDB DocumentClient can usually handle JS null/undefined by omitting the attribute, but explicit null might require special handling depending on SDK version/config. Let's stick to the original behavior of putting null.
      updatedAt: new Date().toISOString()
    };

    const params: DocumentClient.PutItemInput = {
      TableName: SystemConfigModel.getConfigTable(),
      Item: item as any // Type assertion needed if configValue is null, as DocumentClient.PutItemInput expects non-nullable attributes unless specific settings are used or using `UpdateItem` with REMOVE. This might need refinement depending on the actual SystemConfig table structure and desired behavior for 'null'.
    };

    await dynamoDB.put(params).promise();
    return { configKey, configValue };
  } catch (error: any) { // Use 'any' for broader compatibility with error types
    console.error(`❌ Error setting system config ${configKey}:`, error);
    throw new Error(`Error setting system config: ${error.message}`);
  }
}

/**
 * Revisa y corrige inconsistencias en los datos
 * @returns {Promise<ApiResponse>} API response with audit results
 */
export async function auditAndFixData(): Promise<ApiResponse> {
  try {
    const issues: AuditIssues = {
      huevosSinPallets: [],
      palletsInvalidos: [],
      configsInvalidas: []
    };
    const fixes: AuditFixes = {
      huevosCorregidos: 0,
      palletsCorregidos: 0,
      configsCorregidas: 0
    };

    // 1. Verificar huevos con referencias a pallets inexistentes
    // Assuming dbUtils.scanItems returns Array<BoxItem>
    const huevos: BoxItem[] = await dbUtils.scanItems(BoxModel.getTableName()) as BoxItem[];
    // Assuming dbUtils.scanItems returns Array<PalletItem>
    const pallets: PalletItem[] = await dbUtils.scanItems(PalletModel.getTableName()) as PalletItem[];

    // Use 'codigo' as the primary key identifier for pallets based on addBoxToPallet
    const palletIds = new Set(pallets.map(p => p.codigo).filter(codigo => codigo !== undefined));


    for (const huevo of huevos) {
      // Check if palletId exists on the huevo and if that ID is NOT in our set of valid pallet 'codigo's
      if (huevo.palletId && !palletIds.has(huevo.palletId)) {
        issues.huevosSinPallets.push(huevo.codigo);

        // Corregir eliminando la referencia al pallet
        try {
          // Assuming dbUtils.updateItem correctly handles REMOVE and ConditionExpression
          await dbUtils.updateItem(
            BoxModel.getTableName(),
            { codigo: huevo.codigo },
            'REMOVE palletId',
            // ConditionExpression 'palletId = :pid' is problematic if palletId is already removed concurrently.
            // A safer condition might be 'attribute_exists(palletId)' if you just want to remove it if present.
            // Sticking closer to original for now, but note the potential race condition.
            { ':pid': huevo.palletId }, // Original code used a value check in condition
            { 'palletId': 'palletId' } // Correct format for expressionAttributeNames
          );
          fixes.huevosCorregidos++;
        } catch (updateError: any) {
           console.warn(`Error fixing huevo ${huevo.codigo} (might be concurrently updated):`, updateError);
           // Decide whether to re-throw or just log/count. Original code didn't explicitly handle update errors here beyond logging.
           // For audit, maybe just log and don't increment fixes if the update failed.
        }
      }
    }

    // 2. Verificar pallets con información inconsistente
    for (const pallet of pallets) {
      const expectedBoxCount = pallet.cajas ? pallet.cajas.length : 0;

      // Assuming 'cantidadCajas' should match the actual count of 'cajas' list
      if (pallet.cantidadCajas !== expectedBoxCount) {
        issues.palletsInvalidos.push(pallet.codigo); // Use codigo as identifier

        // Corregir la cantidad
        try {
          // Assuming dbUtils.updateItem works
          await dbUtils.updateItem(
            PalletModel.getTableName(),
            { codigo: pallet.codigo }, // Use codigo as the key
            'SET cantidadCajas = :count',
            { ':count': expectedBoxCount }
          );
          fixes.palletsCorregidos++;
        } catch (updateError: any) {
           console.error(`Error fixing pallet ${pallet.codigo}:`, updateError);
           // Decide how to handle update errors here.
        }
      }
    }

    // 3. Verificar configuraciones del sistema
    const activePalletCode: string | null = await getSystemConfig('ACTIVE_PALLET_CODE');

    // Check if the activePalletCode exists and if that ID is NOT in our set of valid pallet 'codigo's
    if (activePalletCode && !palletIds.has(activePalletCode)) {
      issues.configsInvalidas.push('ACTIVE_PALLET_CODE');

      // Corregir eliminando la referencia al pallet activo
      try {
         await setSystemConfig('ACTIVE_PALLET_CODE', null); // Set to null to indicate no active pallet
         fixes.configsCorregidas++;
      } catch (setError: any) {
         console.error(`Error fixing system config ACTIVE_PALLET_CODE:`, setError);
         // Decide how to handle errors setting config.
      }
    }

    // Registro de la auditoría
     const adminLog: AdminLogItem = {
       operacion: 'AUDIT_AND_FIX',
       timestamp: new Date().toISOString(),
       issues: issues, // Log the issues found
       fixes: fixes // Log the fixes applied
       // Add user info if available from request context
     };

    // Assuming dbUtils.putItem works
    await dbUtils.putItem(SystemConfigModel.getAdminLogsTable(), adminLog);


    // Return API response
    const responsePayload: AuditResults = { issues, fixes };
    return createApiResponse(200, "Audit and fix completed successfully", responsePayload);

  } catch (error: any) { // Use 'any' for broader compatibility with error types
    console.error('❌ Error durante la auditoría y corrección de datos:', error);
    // Return an error API response
    return createApiResponse(500, `Error durante la auditoría: ${error.message}`);
  }
}

/**
 * Respalda los datos de la aplicación
 * @returns {Promise<ApiResponse>} API response with backup results
 */
export async function backupData(): Promise<ApiResponse> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // Use a default bucket name if the environment variable is not set
    const backupBucket = process.env.BACKUP_BUCKET || 'huevos-app-backups-default'; // Consider a more robust naming convention or configuration

    // Execute exports for each table
    const tablesToBackup: string[] = [
      BoxModel.getTableName(),
      PalletModel.getTableName(),
      IssueModel.getTableName(),
      SystemConfigModel.getConfigTable(),
      SystemConfigModel.getAdminLogsTable() // Include AdminLogs table in backup
    ];
    const backupResults: BackupResult[] = [];
    let overallStatus: BackupInfoPayload['status'] = 'success';


    for (const table of tablesToBackup) {
      try {
        // Get all data from the table (assuming dbUtils.scanItems handles pagination for large tables)
        // Assuming dbUtils.scanItems returns Array<any> or Array<ItemType>
        const data: any[] = await dbUtils.scanItems(table); // Type assertion might be needed if dbUtils is generic

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
          Body: JSON.stringify(data),
          ContentType: 'application/json'
        }).promise();

        backupResults.push({
          table,
          records: data.length,
          path: `s3://${backupBucket}/${key}`
        });
        console.log(`✅ Backed up ${table} with ${data.length} records to s3://${backupBucket}/${key}`);

      } catch (tableError: any) {
        console.error(`❌ Error backing up table ${table}:`, tableError);
        overallStatus = 'partial_success'; // Mark as partial success if any table fails
        backupResults.push({
          table,
          records: 0, // Indicate 0 records successfully backed up for this table
          path: `Error: ${tableError.message}` // Log the error message in the path
        });
      }
    }

    // Register the backup operation result (even if partial or failed)
     const backupLog: AdminLogItem = {
         operacion: 'BACKUP',
         timestamp: new Date().toISOString(),
         tables: backupResults, // Log the results for each table backup attempt
         // Add user info if available
     };

    try {
       // Assuming dbUtils.putItem works
       await dbUtils.putItem(SystemConfigModel.getAdminLogsTable(), backupLog);
       console.log(`✅ Backup operation logged to ${SystemConfigModel.getAdminLogsTable()}`);
    } catch (logError: any) {
       console.error(`❌ Error logging backup operation to ${SystemConfigModel.getAdminLogsTable()}:`, logError);
       // Decide how to handle logging failure (throw or just warn)
    }


    // Return API response
    const responsePayload: BackupInfoPayload = {
      status: overallStatus,
      timestamp,
      details: backupResults
    };

    const responseMessage = overallStatus === 'success' ? "Backup completed successfully" : "Backup completed with some errors";

    return createApiResponse(overallStatus === 'success' ? 200 : 500, responseMessage, responsePayload);

  } catch (error: any) { // Use 'any' for broader compatibility with error types
    console.error('❌ Error durante el respaldo de datos:', error);

    // Log a failed backup attempt
     const failedBackupLog: AdminLogItem = {
         operacion: 'BACKUP_FAILED',
         timestamp: new Date().toISOString(),
         details: { errorMessage: error.message }
     };
    try {
         await dbUtils.putItem(SystemConfigModel.getAdminLogsTable(), failedBackupLog);
    } catch (logError: any) {
         console.error('❌ Failed to log failed backup operation:', logError);
    }

    // Return an error API response
    return createApiResponse(500, `Error al respaldar datos: ${error.message}`);
  }
}