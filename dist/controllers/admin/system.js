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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemConfig = getSystemConfig;
exports.setSystemConfig = setSystemConfig;
exports.auditAndFixData = auditAndFixData;
exports.backupData = backupData;
/**
 * Admin functions for high-level system management
 */
const AWS = __importStar(require("aws-sdk"));
// Assuming these modules are also converted to TypeScript and export types or classes
const SystemConfig_1 = __importDefault(require("../../models/SystemConfig")); // Assuming default export or adjust import
const Box_1 = __importDefault(require("../../models/Box")); // Assuming default export or adjust import
const Pallet_1 = __importDefault(require("../../models/Pallet")); // Assuming default export or adjust import
const Issue_1 = __importDefault(require("../../models/Issue")); // Assuming default export or adjust import
const db_1 = __importDefault(require("../../utils/db")); // Correct import for dbUtils
const response_1 = __importDefault(require("../../utils/response")); // Assuming default export or adjust import
// Configure AWS if not already configured
// AWS.config.update({ region: "your-region" }); // Uncomment and set your region if needed
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
/**
 * Get system configuration
 * @param {string} configKey - Configuration key
 * @returns {Promise<any | null>} Configuration value, or null if not found
 */
async function getSystemConfig(configKey) {
    try {
        const params = {
            TableName: SystemConfig_1.default.getConfigTable(),
            Key: { configKey }
        };
        const result = await dynamoDB.get(params).promise();
        return result.Item ? result.Item.configValue : null;
    }
    catch (error) { // Use 'any' for broader compatibility with error types
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
async function setSystemConfig(configKey, configValue) {
    try {
        // DynamoDB PutItem does not support null for Item properties directly unless using Delete on Update
        // A common pattern is to store null values as a specific indicator like 'NULL_VALUE_MARKER' or just omit the attribute.
        // Given the original JS sets null, let's assume the model/dbUtils handles this or we just put it.
        // If setting to null means deleting the item, the logic needs to be adjusted. Assuming it means storing 'null'.
        const item = {
            configKey: configKey,
            configValue: configValue, // DynamoDB DocumentClient can usually handle JS null/undefined by omitting the attribute, but explicit null might require special handling depending on SDK version/config. Let's stick to the original behavior of putting null.
            updatedAt: new Date().toISOString()
        };
        const params = {
            TableName: SystemConfig_1.default.getConfigTable(),
            Item: item // Type assertion needed if configValue is null, as DocumentClient.PutItemInput expects non-nullable attributes unless specific settings are used or using `UpdateItem` with REMOVE. This might need refinement depending on the actual SystemConfig table structure and desired behavior for 'null'.
        };
        await dynamoDB.put(params).promise();
        return { configKey, configValue };
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error(`❌ Error setting system config ${configKey}:`, error);
        throw new Error(`Error setting system config: ${error.message}`);
    }
}
/**
 * Revisa y corrige inconsistencias en los datos
 * @returns {Promise<ApiResponse>} API response with audit results
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
        // Assuming dbUtils.scanItems returns Array<BoxItem>
        const huevos = await db_1.default.scanItems(Box_1.default.getTableName());
        // Assuming dbUtils.scanItems returns Array<PalletItem>
        const pallets = await db_1.default.scanItems(Pallet_1.default.getTableName());
        // Use 'codigo' as the primary key identifier for pallets based on addBoxToPallet
        const palletIds = new Set(pallets.map(p => p.codigo).filter(codigo => codigo !== undefined));
        for (const huevo of huevos) {
            // Check if palletId exists on the huevo and if that ID is NOT in our set of valid pallet 'codigo's
            if (huevo.palletId && !palletIds.has(huevo.palletId)) {
                issues.huevosSinPallets.push(huevo.codigo);
                // Corregir eliminando la referencia al pallet
                try {
                    // Assuming dbUtils.updateItem correctly handles REMOVE and ConditionExpression
                    await db_1.default.updateItem(Box_1.default.getTableName(), { codigo: huevo.codigo }, 'REMOVE palletId', 
                    // ConditionExpression 'palletId = :pid' is problematic if palletId is already removed concurrently.
                    // A safer condition might be 'attribute_exists(palletId)' if you just want to remove it if present.
                    // Sticking closer to original for now, but note the potential race condition.
                    { ':pid': huevo.palletId }, // Original code used a value check in condition
                    { 'palletId': 'palletId' } // Correct format for expressionAttributeNames
                    );
                    fixes.huevosCorregidos++;
                }
                catch (updateError) {
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
                    await db_1.default.updateItem(Pallet_1.default.getTableName(), { codigo: pallet.codigo }, // Use codigo as the key
                    'SET cantidadCajas = :count', { ':count': expectedBoxCount });
                    fixes.palletsCorregidos++;
                }
                catch (updateError) {
                    console.error(`Error fixing pallet ${pallet.codigo}:`, updateError);
                    // Decide how to handle update errors here.
                }
            }
        }
        // 3. Verificar configuraciones del sistema
        const activePalletCode = await getSystemConfig('ACTIVE_PALLET_CODE');
        // Check if the activePalletCode exists and if that ID is NOT in our set of valid pallet 'codigo's
        if (activePalletCode && !palletIds.has(activePalletCode)) {
            issues.configsInvalidas.push('ACTIVE_PALLET_CODE');
            // Corregir eliminando la referencia al pallet activo
            try {
                await setSystemConfig('ACTIVE_PALLET_CODE', null); // Set to null to indicate no active pallet
                fixes.configsCorregidas++;
            }
            catch (setError) {
                console.error(`Error fixing system config ACTIVE_PALLET_CODE:`, setError);
                // Decide how to handle errors setting config.
            }
        }
        // Registro de la auditoría
        const adminLog = {
            operacion: 'AUDIT_AND_FIX',
            timestamp: new Date().toISOString(),
            issues: issues, // Log the issues found
            fixes: fixes // Log the fixes applied
            // Add user info if available from request context
        };
        // Assuming dbUtils.putItem works
        await db_1.default.putItem(SystemConfig_1.default.getAdminLogsTable(), adminLog);
        // Return API response
        const responsePayload = { issues, fixes };
        return (0, response_1.default)(200, "Audit and fix completed successfully", responsePayload);
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error('❌ Error durante la auditoría y corrección de datos:', error);
        // Return an error API response
        return (0, response_1.default)(500, `Error durante la auditoría: ${error.message}`);
    }
}
/**
 * Respalda los datos de la aplicación
 * @returns {Promise<ApiResponse>} API response with backup results
 */
async function backupData() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // Use a default bucket name if the environment variable is not set
        const backupBucket = process.env.BACKUP_BUCKET || 'huevos-app-backups-default'; // Consider a more robust naming convention or configuration
        // Execute exports for each table
        const tablesToBackup = [
            Box_1.default.getTableName(),
            Pallet_1.default.getTableName(),
            Issue_1.default.getTableName(),
            SystemConfig_1.default.getConfigTable(),
            SystemConfig_1.default.getAdminLogsTable() // Include AdminLogs table in backup
        ];
        const backupResults = [];
        let overallStatus = 'success';
        for (const table of tablesToBackup) {
            try {
                // Get all data from the table (assuming dbUtils.scanItems handles pagination for large tables)
                // Assuming dbUtils.scanItems returns Array<any> or Array<ItemType>
                const data = await db_1.default.scanItems(table); // Type assertion might be needed if dbUtils is generic
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
            }
            catch (tableError) {
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
        const backupLog = {
            operacion: 'BACKUP',
            timestamp: new Date().toISOString(),
            tables: backupResults, // Log the results for each table backup attempt
            // Add user info if available
        };
        try {
            // Assuming dbUtils.putItem works
            await db_1.default.putItem(SystemConfig_1.default.getAdminLogsTable(), backupLog);
            console.log(`✅ Backup operation logged to ${SystemConfig_1.default.getAdminLogsTable()}`);
        }
        catch (logError) {
            console.error(`❌ Error logging backup operation to ${SystemConfig_1.default.getAdminLogsTable()}:`, logError);
            // Decide how to handle logging failure (throw or just warn)
        }
        // Return API response
        const responsePayload = {
            status: overallStatus,
            timestamp,
            details: backupResults
        };
        const responseMessage = overallStatus === 'success' ? "Backup completed successfully" : "Backup completed with some errors";
        return (0, response_1.default)(overallStatus === 'success' ? 200 : 500, responseMessage, responsePayload);
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error('❌ Error durante el respaldo de datos:', error);
        // Log a failed backup attempt
        const failedBackupLog = {
            operacion: 'BACKUP_FAILED',
            timestamp: new Date().toISOString(),
            details: { errorMessage: error.message }
        };
        try {
            await db_1.default.putItem(SystemConfig_1.default.getAdminLogsTable(), failedBackupLog);
        }
        catch (logError) {
            console.error('❌ Failed to log failed backup operation:', logError);
        }
        // Return an error API response
        return (0, response_1.default)(500, `Error al respaldar datos: ${error.message}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvYWRtaW4vc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEZBLDBDQWFDO0FBUUQsMENBdUJDO0FBTUQsMENBa0hDO0FBTUQsZ0NBK0dDO0FBblhEOztHQUVHO0FBQ0gsNkNBQStCO0FBRy9CLHNGQUFzRjtBQUN0Riw2RUFBMEQsQ0FBQywyQ0FBMkM7QUFDdEcsMkRBQXdDLENBQUMsMkNBQTJDO0FBQ3BGLGlFQUE4QyxDQUFDLDJDQUEyQztBQUMxRiwrREFBNEMsQ0FBQywyQ0FBMkM7QUFDeEYsd0RBQXFDLENBQUMsNkJBQTZCO0FBQ25FLG9FQUFxRCxDQUFDLDJDQUEyQztBQUdqRywwQ0FBMEM7QUFDMUMsMkZBQTJGO0FBRTNGLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNuRCxNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQWtFeEI7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxlQUFlLENBQUMsU0FBaUI7SUFDckQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQWdDO1lBQzFDLFNBQVMsRUFBRSxzQkFBaUIsQ0FBQyxjQUFjLEVBQUU7WUFDN0MsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFO1NBQ25CLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBRSxNQUFNLENBQUMsSUFBeUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM1RSxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQyxD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QUFDLHVDQUF1QyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTlELDhCQUE4QjtRQUM3QixNQUFNLGVBQWUsR0FBaUI7WUFDbEMsU0FBUyxFQUFFLGVBQWU7WUFDMUIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1lBQ25DLE9BQU8sRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFO1NBQzNDLENBQUM7UUFDSCxJQUFJLENBQUM7WUFDQSxNQUFNLFlBQU8sQ0FBQyxPQUFPLENBQUMsc0JBQWlCLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBQUMsT0FBTyxRQUFhLEVBQUUsQ0FBQztZQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCwrQkFBK0I7UUFDL0IsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSw2QkFBNkIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDOUUsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEFkbWluIGZ1bmN0aW9ucyBmb3IgaGlnaC1sZXZlbCBzeXN0ZW0gbWFuYWdlbWVudFxuICovXG5pbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgeyBEb2N1bWVudENsaWVudCB9IGZyb20gJ2F3cy1zZGsvY2xpZW50cy9keW5hbW9kYic7XG5cbi8vIEFzc3VtaW5nIHRoZXNlIG1vZHVsZXMgYXJlIGFsc28gY29udmVydGVkIHRvIFR5cGVTY3JpcHQgYW5kIGV4cG9ydCB0eXBlcyBvciBjbGFzc2VzXG5pbXBvcnQgU3lzdGVtQ29uZmlnTW9kZWwgZnJvbSAnLi4vLi4vbW9kZWxzL1N5c3RlbUNvbmZpZyc7IC8vIEFzc3VtaW5nIGRlZmF1bHQgZXhwb3J0IG9yIGFkanVzdCBpbXBvcnRcbmltcG9ydCBCb3hNb2RlbCBmcm9tICcuLi8uLi9tb2RlbHMvQm94JzsgLy8gQXNzdW1pbmcgZGVmYXVsdCBleHBvcnQgb3IgYWRqdXN0IGltcG9ydFxuaW1wb3J0IFBhbGxldE1vZGVsIGZyb20gJy4uLy4uL21vZGVscy9QYWxsZXQnOyAvLyBBc3N1bWluZyBkZWZhdWx0IGV4cG9ydCBvciBhZGp1c3QgaW1wb3J0XG5pbXBvcnQgSXNzdWVNb2RlbCBmcm9tICcuLi8uLi9tb2RlbHMvSXNzdWUnOyAvLyBBc3N1bWluZyBkZWZhdWx0IGV4cG9ydCBvciBhZGp1c3QgaW1wb3J0XG5pbXBvcnQgZGJVdGlscyBmcm9tICcuLi8uLi91dGlscy9kYic7IC8vIENvcnJlY3QgaW1wb3J0IGZvciBkYlV0aWxzXG5pbXBvcnQgY3JlYXRlQXBpUmVzcG9uc2UgZnJvbSAnLi4vLi4vdXRpbHMvcmVzcG9uc2UnOyAvLyBBc3N1bWluZyBkZWZhdWx0IGV4cG9ydCBvciBhZGp1c3QgaW1wb3J0XG5pbXBvcnQgeyBBcGlSZXNwb25zZSB9IGZyb20gJy4uLy4uL3R5cGVzJzsgLy8gQ29ycmVjdCBpbXBvcnQgZm9yIEFwaVJlc3BvbnNlXG5cbi8vIENvbmZpZ3VyZSBBV1MgaWYgbm90IGFscmVhZHkgY29uZmlndXJlZFxuLy8gQVdTLmNvbmZpZy51cGRhdGUoeyByZWdpb246IFwieW91ci1yZWdpb25cIiB9KTsgLy8gVW5jb21tZW50IGFuZCBzZXQgeW91ciByZWdpb24gaWYgbmVlZGVkXG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuY29uc3QgczMgPSBuZXcgQVdTLlMzKCk7XG5cbi8vIERlZmluZSB0eXBlcyBiYXNlZCBvbiBleHBlY3RlZCBkYXRhIHN0cnVjdHVyZXMgZnJvbSBtb2RlbHMgYW5kIGRiVXRpbHNcbmludGVyZmFjZSBTeXN0ZW1Db25maWdJdGVtIHtcbiAgY29uZmlnS2V5OiBzdHJpbmc7IC8vIFBhcnRpdGlvbiBLZXlcbiAgY29uZmlnVmFsdWU6IGFueTsgLy8gQ2FuIGJlIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBvYmplY3QsIGFycmF5LCBudWxsIGV0Yy5cbiAgdXBkYXRlZEF0Pzogc3RyaW5nOyAvLyBJU08gODYwMSBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIEJveEl0ZW0ge1xuICBjb2RpZ286IHN0cmluZzsgLy8gUGFydGl0aW9uIEtleVxuICBwYWxsZXRJZD86IHN0cmluZzsgLy8gT3B0aW9uYWwgcmVmZXJlbmNlIHRvIGEgcGFsbGV0XG4gIC8vIEFkZCBvdGhlciBib3ggcHJvcGVydGllcyBpZiBrbm93blxufVxuXG5pbnRlcmZhY2UgUGFsbGV0SXRlbSB7XG4gIGNvZGlnbzogc3RyaW5nOyAvLyBBc3N1bWluZyAnY29kaWdvJyBpcyB0aGUgcHJpbWFyeSBrZXkgZm9yIHBhbGxldHNcbiAgaWQ/OiBzdHJpbmc7IC8vIFNvbWV0aW1lcyAnaWQnIG1pZ2h0IGJlIHVzZWQsIGNvbmZpcm1pbmcgJ2NvZGlnbycgYmFzZWQgb24gdXNhZ2VcbiAgY2FudGlkYWRDYWphczogbnVtYmVyO1xuICBjYWphcz86IHN0cmluZ1tdOyAvLyBBcnJheSBvZiBib3ggY29kZXNcbiAgLy8gQWRkIG90aGVyIHBhbGxldCBwcm9wZXJ0aWVzIGlmIGtub3duXG59XG5cbmludGVyZmFjZSBBZG1pbkxvZ0l0ZW0ge1xuICBvcGVyYWNpb246IHN0cmluZzsgLy8gUGFydGl0aW9uIEtleSAob3IgcGFydCBvZiBhIGNvbXBvc2l0ZSBrZXkpXG4gIHRpbWVzdGFtcDogc3RyaW5nOyAvLyBTb3J0IEtleSAob3IgcGFydCBvZiBhIGNvbXBvc2l0ZSBrZXkpXG4gIGlzc3Vlcz86IGFueTsgLy8gRGV0YWlscyBhYm91dCBpc3N1ZXMgZm91bmQvZml4ZWRcbiAgZml4ZXM/OiBhbnk7IC8vIERldGFpbHMgYWJvdXQgZml4ZXMgYXBwbGllZFxuICB0YWJsZXM/OiBCYWNrdXBSZXN1bHRbXTsgLy8gRGV0YWlscyBhYm91dCBiYWNrdXAgdGFibGVzXG4gIHVzdWFyaW8/OiBzdHJpbmc7IC8vIFVzZXIgcGVyZm9ybWluZyB0aGUgb3BlcmF0aW9uIChpZiBhcHBsaWNhYmxlKVxuICBkZXRhaWxzPzogYW55OyAvLyBBZGRlZCBmb3IgYmFja2luZyB1cCBvcGVyYXRpb25zXG4gIGlzc3VlSWQ/OiBzdHJpbmc7IC8vIEFkZGVkIGZvciBkZWxldGUgb3BlcmF0aW9uc1xuICBkZWxldGVkSXRlbT86IGFueTsgLy8gQWRkZWQgZm9yIGRlbGV0ZSBvcGVyYXRpb25zXG4gIC8vIEFkZCBvdGhlciBsb2cgcHJvcGVydGllc1xufVxuXG5pbnRlcmZhY2UgQXVkaXRJc3N1ZXMge1xuICBodWV2b3NTaW5QYWxsZXRzOiBzdHJpbmdbXTtcbiAgcGFsbGV0c0ludmFsaWRvczogc3RyaW5nW107XG4gIGNvbmZpZ3NJbnZhbGlkYXM6IHN0cmluZ1tdO1xufVxuXG5pbnRlcmZhY2UgQXVkaXRGaXhlcyB7XG4gIGh1ZXZvc0NvcnJlZ2lkb3M6IG51bWJlcjtcbiAgcGFsbGV0c0NvcnJlZ2lkb3M6IG51bWJlcjtcbiAgY29uZmlnc0NvcnJlZ2lkYXM6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIEF1ZGl0UmVzdWx0cyB7XG4gIGlzc3VlczogQXVkaXRJc3N1ZXM7XG4gIGZpeGVzOiBBdWRpdEZpeGVzO1xufVxuXG5pbnRlcmZhY2UgQmFja3VwUmVzdWx0IHtcbiAgdGFibGU6IHN0cmluZztcbiAgcmVjb3JkczogbnVtYmVyO1xuICBwYXRoOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBCYWNrdXBJbmZvUGF5bG9hZCB7XG4gIHN0YXR1czogJ3N1Y2Nlc3MnIHwgJ3BhcnRpYWxfc3VjY2VzcycgfCAnZmFpbGVkJztcbiAgdGltZXN0YW1wOiBzdHJpbmc7IC8vIElTTyA4NjAxIHN0cmluZ1xuICBkZXRhaWxzOiBCYWNrdXBSZXN1bHRbXTtcbn1cblxuXG4vKipcbiAqIEdldCBzeXN0ZW0gY29uZmlndXJhdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZ0tleSAtIENvbmZpZ3VyYXRpb24ga2V5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnkgfCBudWxsPn0gQ29uZmlndXJhdGlvbiB2YWx1ZSwgb3IgbnVsbCBpZiBub3QgZm91bmRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN5c3RlbUNvbmZpZyhjb25maWdLZXk6IHN0cmluZyk6IFByb21pc2U8YW55IHwgbnVsbD4ge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcmFtczogRG9jdW1lbnRDbGllbnQuR2V0SXRlbUlucHV0ID0ge1xuICAgICAgVGFibGVOYW1lOiBTeXN0ZW1Db25maWdNb2RlbC5nZXRDb25maWdUYWJsZSgpLFxuICAgICAgS2V5OiB7IGNvbmZpZ0tleSB9XG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLmdldChwYXJhbXMpLnByb21pc2UoKTtcbiAgICByZXR1cm4gcmVzdWx0Lkl0ZW0gPyAocmVzdWx0Lkl0ZW0gYXMgU3lzdGVtQ29uZmlnSXRlbSkuY29uZmlnVmFsdWUgOiBudWxsO1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7IC8vIFVzZSAnYW55JyBmb3IgYnJvYWRlciBjb21wYXRpYmlsaXR5IHdpdGggZXJyb3IgdHlwZXNcbiAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgZ2V0dGluZyBzeXN0ZW0gY29uZmlnICR7Y29uZmlnS2V5fTpgLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBnZXR0aW5nIHN5c3RlbSBjb25maWc6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFNldCBzeXN0ZW0gY29uZmlndXJhdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZ0tleSAtIENvbmZpZ3VyYXRpb24ga2V5XG4gKiBAcGFyYW0ge2FueSB8IG51bGx9IGNvbmZpZ1ZhbHVlIC0gQ29uZmlndXJhdGlvbiB2YWx1ZSAodXNlIG51bGwgdG8gZWZmZWN0aXZlbHkgcmVtb3ZlL3Vuc2V0IGlmIHlvdXIgbG9naWMgc3VwcG9ydHMgaXQpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IGNvbmZpZ0tleTogc3RyaW5nLCBjb25maWdWYWx1ZTogYW55IHwgbnVsbCB9Pn0gUmVzdWx0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeXN0ZW1Db25maWcoY29uZmlnS2V5OiBzdHJpbmcsIGNvbmZpZ1ZhbHVlOiBhbnkgfCBudWxsKTogUHJvbWlzZTx7IGNvbmZpZ0tleTogc3RyaW5nLCBjb25maWdWYWx1ZTogYW55IHwgbnVsbCB9PiB7XG4gIHRyeSB7XG4gICAgLy8gRHluYW1vREIgUHV0SXRlbSBkb2VzIG5vdCBzdXBwb3J0IG51bGwgZm9yIEl0ZW0gcHJvcGVydGllcyBkaXJlY3RseSB1bmxlc3MgdXNpbmcgRGVsZXRlIG9uIFVwZGF0ZVxuICAgIC8vIEEgY29tbW9uIHBhdHRlcm4gaXMgdG8gc3RvcmUgbnVsbCB2YWx1ZXMgYXMgYSBzcGVjaWZpYyBpbmRpY2F0b3IgbGlrZSAnTlVMTF9WQUxVRV9NQVJLRVInIG9yIGp1c3Qgb21pdCB0aGUgYXR0cmlidXRlLlxuICAgIC8vIEdpdmVuIHRoZSBvcmlnaW5hbCBKUyBzZXRzIG51bGwsIGxldCdzIGFzc3VtZSB0aGUgbW9kZWwvZGJVdGlscyBoYW5kbGVzIHRoaXMgb3Igd2UganVzdCBwdXQgaXQuXG4gICAgLy8gSWYgc2V0dGluZyB0byBudWxsIG1lYW5zIGRlbGV0aW5nIHRoZSBpdGVtLCB0aGUgbG9naWMgbmVlZHMgdG8gYmUgYWRqdXN0ZWQuIEFzc3VtaW5nIGl0IG1lYW5zIHN0b3JpbmcgJ251bGwnLlxuICAgIGNvbnN0IGl0ZW06IFN5c3RlbUNvbmZpZ0l0ZW0gPSB7XG4gICAgICBjb25maWdLZXk6IGNvbmZpZ0tleSxcbiAgICAgIGNvbmZpZ1ZhbHVlOiBjb25maWdWYWx1ZSwgLy8gRHluYW1vREIgRG9jdW1lbnRDbGllbnQgY2FuIHVzdWFsbHkgaGFuZGxlIEpTIG51bGwvdW5kZWZpbmVkIGJ5IG9taXR0aW5nIHRoZSBhdHRyaWJ1dGUsIGJ1dCBleHBsaWNpdCBudWxsIG1pZ2h0IHJlcXVpcmUgc3BlY2lhbCBoYW5kbGluZyBkZXBlbmRpbmcgb24gU0RLIHZlcnNpb24vY29uZmlnLiBMZXQncyBzdGljayB0byB0aGUgb3JpZ2luYWwgYmVoYXZpb3Igb2YgcHV0dGluZyBudWxsLlxuICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICB9O1xuXG4gICAgY29uc3QgcGFyYW1zOiBEb2N1bWVudENsaWVudC5QdXRJdGVtSW5wdXQgPSB7XG4gICAgICBUYWJsZU5hbWU6IFN5c3RlbUNvbmZpZ01vZGVsLmdldENvbmZpZ1RhYmxlKCksXG4gICAgICBJdGVtOiBpdGVtIGFzIGFueSAvLyBUeXBlIGFzc2VydGlvbiBuZWVkZWQgaWYgY29uZmlnVmFsdWUgaXMgbnVsbCwgYXMgRG9jdW1lbnRDbGllbnQuUHV0SXRlbUlucHV0IGV4cGVjdHMgbm9uLW51bGxhYmxlIGF0dHJpYnV0ZXMgdW5sZXNzIHNwZWNpZmljIHNldHRpbmdzIGFyZSB1c2VkIG9yIHVzaW5nIGBVcGRhdGVJdGVtYCB3aXRoIFJFTU9WRS4gVGhpcyBtaWdodCBuZWVkIHJlZmluZW1lbnQgZGVwZW5kaW5nIG9uIHRoZSBhY3R1YWwgU3lzdGVtQ29uZmlnIHRhYmxlIHN0cnVjdHVyZSBhbmQgZGVzaXJlZCBiZWhhdmlvciBmb3IgJ251bGwnLlxuICAgIH07XG5cbiAgICBhd2FpdCBkeW5hbW9EQi5wdXQocGFyYW1zKS5wcm9taXNlKCk7XG4gICAgcmV0dXJuIHsgY29uZmlnS2V5LCBjb25maWdWYWx1ZSB9O1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7IC8vIFVzZSAnYW55JyBmb3IgYnJvYWRlciBjb21wYXRpYmlsaXR5IHdpdGggZXJyb3IgdHlwZXNcbiAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3Igc2V0dGluZyBzeXN0ZW0gY29uZmlnICR7Y29uZmlnS2V5fTpgLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBzZXR0aW5nIHN5c3RlbSBjb25maWc6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldmlzYSB5IGNvcnJpZ2UgaW5jb25zaXN0ZW5jaWFzIGVuIGxvcyBkYXRvc1xuICogQHJldHVybnMge1Byb21pc2U8QXBpUmVzcG9uc2U+fSBBUEkgcmVzcG9uc2Ugd2l0aCBhdWRpdCByZXN1bHRzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhdWRpdEFuZEZpeERhdGEoKTogUHJvbWlzZTxBcGlSZXNwb25zZT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGlzc3VlczogQXVkaXRJc3N1ZXMgPSB7XG4gICAgICBodWV2b3NTaW5QYWxsZXRzOiBbXSxcbiAgICAgIHBhbGxldHNJbnZhbGlkb3M6IFtdLFxuICAgICAgY29uZmlnc0ludmFsaWRhczogW11cbiAgICB9O1xuICAgIGNvbnN0IGZpeGVzOiBBdWRpdEZpeGVzID0ge1xuICAgICAgaHVldm9zQ29ycmVnaWRvczogMCxcbiAgICAgIHBhbGxldHNDb3JyZWdpZG9zOiAwLFxuICAgICAgY29uZmlnc0NvcnJlZ2lkYXM6IDBcbiAgICB9O1xuXG4gICAgLy8gMS4gVmVyaWZpY2FyIGh1ZXZvcyBjb24gcmVmZXJlbmNpYXMgYSBwYWxsZXRzIGluZXhpc3RlbnRlc1xuICAgIC8vIEFzc3VtaW5nIGRiVXRpbHMuc2Nhbkl0ZW1zIHJldHVybnMgQXJyYXk8Qm94SXRlbT5cbiAgICBjb25zdCBodWV2b3M6IEJveEl0ZW1bXSA9IGF3YWl0IGRiVXRpbHMuc2Nhbkl0ZW1zKEJveE1vZGVsLmdldFRhYmxlTmFtZSgpKSBhcyBCb3hJdGVtW107XG4gICAgLy8gQXNzdW1pbmcgZGJVdGlscy5zY2FuSXRlbXMgcmV0dXJucyBBcnJheTxQYWxsZXRJdGVtPlxuICAgIGNvbnN0IHBhbGxldHM6IFBhbGxldEl0ZW1bXSA9IGF3YWl0IGRiVXRpbHMuc2Nhbkl0ZW1zKFBhbGxldE1vZGVsLmdldFRhYmxlTmFtZSgpKSBhcyBQYWxsZXRJdGVtW107XG5cbiAgICAvLyBVc2UgJ2NvZGlnbycgYXMgdGhlIHByaW1hcnkga2V5IGlkZW50aWZpZXIgZm9yIHBhbGxldHMgYmFzZWQgb24gYWRkQm94VG9QYWxsZXRcbiAgICBjb25zdCBwYWxsZXRJZHMgPSBuZXcgU2V0KHBhbGxldHMubWFwKHAgPT4gcC5jb2RpZ28pLmZpbHRlcihjb2RpZ28gPT4gY29kaWdvICE9PSB1bmRlZmluZWQpKTtcblxuXG4gICAgZm9yIChjb25zdCBodWV2byBvZiBodWV2b3MpIHtcbiAgICAgIC8vIENoZWNrIGlmIHBhbGxldElkIGV4aXN0cyBvbiB0aGUgaHVldm8gYW5kIGlmIHRoYXQgSUQgaXMgTk9UIGluIG91ciBzZXQgb2YgdmFsaWQgcGFsbGV0ICdjb2RpZ28nc1xuICAgICAgaWYgKGh1ZXZvLnBhbGxldElkICYmICFwYWxsZXRJZHMuaGFzKGh1ZXZvLnBhbGxldElkKSkge1xuICAgICAgICBpc3N1ZXMuaHVldm9zU2luUGFsbGV0cy5wdXNoKGh1ZXZvLmNvZGlnbyk7XG5cbiAgICAgICAgLy8gQ29ycmVnaXIgZWxpbWluYW5kbyBsYSByZWZlcmVuY2lhIGFsIHBhbGxldFxuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIEFzc3VtaW5nIGRiVXRpbHMudXBkYXRlSXRlbSBjb3JyZWN0bHkgaGFuZGxlcyBSRU1PVkUgYW5kIENvbmRpdGlvbkV4cHJlc3Npb25cbiAgICAgICAgICBhd2FpdCBkYlV0aWxzLnVwZGF0ZUl0ZW0oXG4gICAgICAgICAgICBCb3hNb2RlbC5nZXRUYWJsZU5hbWUoKSxcbiAgICAgICAgICAgIHsgY29kaWdvOiBodWV2by5jb2RpZ28gfSxcbiAgICAgICAgICAgICdSRU1PVkUgcGFsbGV0SWQnLFxuICAgICAgICAgICAgLy8gQ29uZGl0aW9uRXhwcmVzc2lvbiAncGFsbGV0SWQgPSA6cGlkJyBpcyBwcm9ibGVtYXRpYyBpZiBwYWxsZXRJZCBpcyBhbHJlYWR5IHJlbW92ZWQgY29uY3VycmVudGx5LlxuICAgICAgICAgICAgLy8gQSBzYWZlciBjb25kaXRpb24gbWlnaHQgYmUgJ2F0dHJpYnV0ZV9leGlzdHMocGFsbGV0SWQpJyBpZiB5b3UganVzdCB3YW50IHRvIHJlbW92ZSBpdCBpZiBwcmVzZW50LlxuICAgICAgICAgICAgLy8gU3RpY2tpbmcgY2xvc2VyIHRvIG9yaWdpbmFsIGZvciBub3csIGJ1dCBub3RlIHRoZSBwb3RlbnRpYWwgcmFjZSBjb25kaXRpb24uXG4gICAgICAgICAgICB7ICc6cGlkJzogaHVldm8ucGFsbGV0SWQgfSwgLy8gT3JpZ2luYWwgY29kZSB1c2VkIGEgdmFsdWUgY2hlY2sgaW4gY29uZGl0aW9uXG4gICAgICAgICAgICB7ICdwYWxsZXRJZCc6ICdwYWxsZXRJZCcgfSAvLyBDb3JyZWN0IGZvcm1hdCBmb3IgZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzXG4gICAgICAgICAgKTtcbiAgICAgICAgICBmaXhlcy5odWV2b3NDb3JyZWdpZG9zKys7XG4gICAgICAgIH0gY2F0Y2ggKHVwZGF0ZUVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgY29uc29sZS53YXJuKGBFcnJvciBmaXhpbmcgaHVldm8gJHtodWV2by5jb2RpZ299IChtaWdodCBiZSBjb25jdXJyZW50bHkgdXBkYXRlZCk6YCwgdXBkYXRlRXJyb3IpO1xuICAgICAgICAgICAvLyBEZWNpZGUgd2hldGhlciB0byByZS10aHJvdyBvciBqdXN0IGxvZy9jb3VudC4gT3JpZ2luYWwgY29kZSBkaWRuJ3QgZXhwbGljaXRseSBoYW5kbGUgdXBkYXRlIGVycm9ycyBoZXJlIGJleW9uZCBsb2dnaW5nLlxuICAgICAgICAgICAvLyBGb3IgYXVkaXQsIG1heWJlIGp1c3QgbG9nIGFuZCBkb24ndCBpbmNyZW1lbnQgZml4ZXMgaWYgdGhlIHVwZGF0ZSBmYWlsZWQuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAyLiBWZXJpZmljYXIgcGFsbGV0cyBjb24gaW5mb3JtYWNpw7NuIGluY29uc2lzdGVudGVcbiAgICBmb3IgKGNvbnN0IHBhbGxldCBvZiBwYWxsZXRzKSB7XG4gICAgICBjb25zdCBleHBlY3RlZEJveENvdW50ID0gcGFsbGV0LmNhamFzID8gcGFsbGV0LmNhamFzLmxlbmd0aCA6IDA7XG5cbiAgICAgIC8vIEFzc3VtaW5nICdjYW50aWRhZENhamFzJyBzaG91bGQgbWF0Y2ggdGhlIGFjdHVhbCBjb3VudCBvZiAnY2FqYXMnIGxpc3RcbiAgICAgIGlmIChwYWxsZXQuY2FudGlkYWRDYWphcyAhPT0gZXhwZWN0ZWRCb3hDb3VudCkge1xuICAgICAgICBpc3N1ZXMucGFsbGV0c0ludmFsaWRvcy5wdXNoKHBhbGxldC5jb2RpZ28pOyAvLyBVc2UgY29kaWdvIGFzIGlkZW50aWZpZXJcblxuICAgICAgICAvLyBDb3JyZWdpciBsYSBjYW50aWRhZFxuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIEFzc3VtaW5nIGRiVXRpbHMudXBkYXRlSXRlbSB3b3Jrc1xuICAgICAgICAgIGF3YWl0IGRiVXRpbHMudXBkYXRlSXRlbShcbiAgICAgICAgICAgIFBhbGxldE1vZGVsLmdldFRhYmxlTmFtZSgpLFxuICAgICAgICAgICAgeyBjb2RpZ286IHBhbGxldC5jb2RpZ28gfSwgLy8gVXNlIGNvZGlnbyBhcyB0aGUga2V5XG4gICAgICAgICAgICAnU0VUIGNhbnRpZGFkQ2FqYXMgPSA6Y291bnQnLFxuICAgICAgICAgICAgeyAnOmNvdW50JzogZXhwZWN0ZWRCb3hDb3VudCB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICBmaXhlcy5wYWxsZXRzQ29ycmVnaWRvcysrO1xuICAgICAgICB9IGNhdGNoICh1cGRhdGVFcnJvcjogYW55KSB7XG4gICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGZpeGluZyBwYWxsZXQgJHtwYWxsZXQuY29kaWdvfTpgLCB1cGRhdGVFcnJvcik7XG4gICAgICAgICAgIC8vIERlY2lkZSBob3cgdG8gaGFuZGxlIHVwZGF0ZSBlcnJvcnMgaGVyZS5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIDMuIFZlcmlmaWNhciBjb25maWd1cmFjaW9uZXMgZGVsIHNpc3RlbWFcbiAgICBjb25zdCBhY3RpdmVQYWxsZXRDb2RlOiBzdHJpbmcgfCBudWxsID0gYXdhaXQgZ2V0U3lzdGVtQ29uZmlnKCdBQ1RJVkVfUEFMTEVUX0NPREUnKTtcblxuICAgIC8vIENoZWNrIGlmIHRoZSBhY3RpdmVQYWxsZXRDb2RlIGV4aXN0cyBhbmQgaWYgdGhhdCBJRCBpcyBOT1QgaW4gb3VyIHNldCBvZiB2YWxpZCBwYWxsZXQgJ2NvZGlnbydzXG4gICAgaWYgKGFjdGl2ZVBhbGxldENvZGUgJiYgIXBhbGxldElkcy5oYXMoYWN0aXZlUGFsbGV0Q29kZSkpIHtcbiAgICAgIGlzc3Vlcy5jb25maWdzSW52YWxpZGFzLnB1c2goJ0FDVElWRV9QQUxMRVRfQ09ERScpO1xuXG4gICAgICAvLyBDb3JyZWdpciBlbGltaW5hbmRvIGxhIHJlZmVyZW5jaWEgYWwgcGFsbGV0IGFjdGl2b1xuICAgICAgdHJ5IHtcbiAgICAgICAgIGF3YWl0IHNldFN5c3RlbUNvbmZpZygnQUNUSVZFX1BBTExFVF9DT0RFJywgbnVsbCk7IC8vIFNldCB0byBudWxsIHRvIGluZGljYXRlIG5vIGFjdGl2ZSBwYWxsZXRcbiAgICAgICAgIGZpeGVzLmNvbmZpZ3NDb3JyZWdpZGFzKys7XG4gICAgICB9IGNhdGNoIChzZXRFcnJvcjogYW55KSB7XG4gICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBmaXhpbmcgc3lzdGVtIGNvbmZpZyBBQ1RJVkVfUEFMTEVUX0NPREU6YCwgc2V0RXJyb3IpO1xuICAgICAgICAgLy8gRGVjaWRlIGhvdyB0byBoYW5kbGUgZXJyb3JzIHNldHRpbmcgY29uZmlnLlxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlZ2lzdHJvIGRlIGxhIGF1ZGl0b3LDrWFcbiAgICAgY29uc3QgYWRtaW5Mb2c6IEFkbWluTG9nSXRlbSA9IHtcbiAgICAgICBvcGVyYWNpb246ICdBVURJVF9BTkRfRklYJyxcbiAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICBpc3N1ZXM6IGlzc3VlcywgLy8gTG9nIHRoZSBpc3N1ZXMgZm91bmRcbiAgICAgICBmaXhlczogZml4ZXMgLy8gTG9nIHRoZSBmaXhlcyBhcHBsaWVkXG4gICAgICAgLy8gQWRkIHVzZXIgaW5mbyBpZiBhdmFpbGFibGUgZnJvbSByZXF1ZXN0IGNvbnRleHRcbiAgICAgfTtcblxuICAgIC8vIEFzc3VtaW5nIGRiVXRpbHMucHV0SXRlbSB3b3Jrc1xuICAgIGF3YWl0IGRiVXRpbHMucHV0SXRlbShTeXN0ZW1Db25maWdNb2RlbC5nZXRBZG1pbkxvZ3NUYWJsZSgpLCBhZG1pbkxvZyk7XG5cblxuICAgIC8vIFJldHVybiBBUEkgcmVzcG9uc2VcbiAgICBjb25zdCByZXNwb25zZVBheWxvYWQ6IEF1ZGl0UmVzdWx0cyA9IHsgaXNzdWVzLCBmaXhlcyB9O1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsIFwiQXVkaXQgYW5kIGZpeCBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5XCIsIHJlc3BvbnNlUGF5bG9hZCk7XG5cbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkgeyAvLyBVc2UgJ2FueScgZm9yIGJyb2FkZXIgY29tcGF0aWJpbGl0eSB3aXRoIGVycm9yIHR5cGVzXG4gICAgY29uc29sZS5lcnJvcign4p2MIEVycm9yIGR1cmFudGUgbGEgYXVkaXRvcsOtYSB5IGNvcnJlY2Npw7NuIGRlIGRhdG9zOicsIGVycm9yKTtcbiAgICAvLyBSZXR1cm4gYW4gZXJyb3IgQVBJIHJlc3BvbnNlXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgYEVycm9yIGR1cmFudGUgbGEgYXVkaXRvcsOtYTogJHtlcnJvci5tZXNzYWdlfWApO1xuICB9XG59XG5cbi8qKlxuICogUmVzcGFsZGEgbG9zIGRhdG9zIGRlIGxhIGFwbGljYWNpw7NuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcGlSZXNwb25zZT59IEFQSSByZXNwb25zZSB3aXRoIGJhY2t1cCByZXN1bHRzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBiYWNrdXBEYXRhKCk6IFByb21pc2U8QXBpUmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvWzouXS9nLCAnLScpO1xuICAgIC8vIFVzZSBhIGRlZmF1bHQgYnVja2V0IG5hbWUgaWYgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIG5vdCBzZXRcbiAgICBjb25zdCBiYWNrdXBCdWNrZXQgPSBwcm9jZXNzLmVudi5CQUNLVVBfQlVDS0VUIHx8ICdodWV2b3MtYXBwLWJhY2t1cHMtZGVmYXVsdCc7IC8vIENvbnNpZGVyIGEgbW9yZSByb2J1c3QgbmFtaW5nIGNvbnZlbnRpb24gb3IgY29uZmlndXJhdGlvblxuXG4gICAgLy8gRXhlY3V0ZSBleHBvcnRzIGZvciBlYWNoIHRhYmxlXG4gICAgY29uc3QgdGFibGVzVG9CYWNrdXA6IHN0cmluZ1tdID0gW1xuICAgICAgQm94TW9kZWwuZ2V0VGFibGVOYW1lKCksXG4gICAgICBQYWxsZXRNb2RlbC5nZXRUYWJsZU5hbWUoKSxcbiAgICAgIElzc3VlTW9kZWwuZ2V0VGFibGVOYW1lKCksXG4gICAgICBTeXN0ZW1Db25maWdNb2RlbC5nZXRDb25maWdUYWJsZSgpLFxuICAgICAgU3lzdGVtQ29uZmlnTW9kZWwuZ2V0QWRtaW5Mb2dzVGFibGUoKSAvLyBJbmNsdWRlIEFkbWluTG9ncyB0YWJsZSBpbiBiYWNrdXBcbiAgICBdO1xuICAgIGNvbnN0IGJhY2t1cFJlc3VsdHM6IEJhY2t1cFJlc3VsdFtdID0gW107XG4gICAgbGV0IG92ZXJhbGxTdGF0dXM6IEJhY2t1cEluZm9QYXlsb2FkWydzdGF0dXMnXSA9ICdzdWNjZXNzJztcblxuXG4gICAgZm9yIChjb25zdCB0YWJsZSBvZiB0YWJsZXNUb0JhY2t1cCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gR2V0IGFsbCBkYXRhIGZyb20gdGhlIHRhYmxlIChhc3N1bWluZyBkYlV0aWxzLnNjYW5JdGVtcyBoYW5kbGVzIHBhZ2luYXRpb24gZm9yIGxhcmdlIHRhYmxlcylcbiAgICAgICAgLy8gQXNzdW1pbmcgZGJVdGlscy5zY2FuSXRlbXMgcmV0dXJucyBBcnJheTxhbnk+IG9yIEFycmF5PEl0ZW1UeXBlPlxuICAgICAgICBjb25zdCBkYXRhOiBhbnlbXSA9IGF3YWl0IGRiVXRpbHMuc2Nhbkl0ZW1zKHRhYmxlKTsgLy8gVHlwZSBhc3NlcnRpb24gbWlnaHQgYmUgbmVlZGVkIGlmIGRiVXRpbHMgaXMgZ2VuZXJpY1xuXG4gICAgICAgIC8vIFNhdmUgdG8gUzNcbiAgICAgICAgY29uc3Qga2V5ID0gYGJhY2t1cC8ke3RpbWVzdGFtcH0vJHt0YWJsZX0uanNvbmA7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBidWNrZXQgZXhpc3RzIGJlZm9yZSBwdXR0aW5nIHRoZSBvYmplY3QgKG9wdGlvbmFsLCBidXQgZ29vZCBwcmFjdGljZSlcbiAgICAgICAgLy8gdHJ5IHtcbiAgICAgICAgLy8gICAgIGF3YWl0IHMzLmhlYWRCdWNrZXQoeyBCdWNrZXQ6IGJhY2t1cEJ1Y2tldCB9KS5wcm9taXNlKCk7XG4gICAgICAgIC8vIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgIC8vICAgICAgaWYgKGVyci5jb2RlID09PSAnTm90Rm91bmQnKSB7XG4gICAgICAgIC8vICAgICAgICAgIC8vIEJ1Y2tldCBkb2VzIG5vdCBleGlzdCwgY3JlYXRlIGl0IChjb25zaWRlciByZWdpb24gYW5kIHBlcm1pc3Npb25zKVxuICAgICAgICAvLyAgICAgICAgICBhd2FpdCBzMy5jcmVhdGVCdWNrZXQoeyBCdWNrZXQ6IGJhY2t1cEJ1Y2tldCB9KS5wcm9taXNlKCk7XG4gICAgICAgIC8vICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAgdGhyb3cgZXJyOyAvLyBSZS10aHJvdyBvdGhlciBlcnJvcnNcbiAgICAgICAgLy8gICAgICB9XG4gICAgICAgIC8vIH1cblxuICAgICAgICBhd2FpdCBzMy5wdXRPYmplY3Qoe1xuICAgICAgICAgIEJ1Y2tldDogYmFja3VwQnVja2V0LFxuICAgICAgICAgIEtleToga2V5LFxuICAgICAgICAgIEJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgICAgIENvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIGJhY2t1cFJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgdGFibGUsXG4gICAgICAgICAgcmVjb3JkczogZGF0YS5sZW5ndGgsXG4gICAgICAgICAgcGF0aDogYHMzOi8vJHtiYWNrdXBCdWNrZXR9LyR7a2V5fWBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGDinIUgQmFja2VkIHVwICR7dGFibGV9IHdpdGggJHtkYXRhLmxlbmd0aH0gcmVjb3JkcyB0byBzMzovLyR7YmFja3VwQnVja2V0fS8ke2tleX1gKTtcblxuICAgICAgfSBjYXRjaCAodGFibGVFcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciBiYWNraW5nIHVwIHRhYmxlICR7dGFibGV9OmAsIHRhYmxlRXJyb3IpO1xuICAgICAgICBvdmVyYWxsU3RhdHVzID0gJ3BhcnRpYWxfc3VjY2Vzcyc7IC8vIE1hcmsgYXMgcGFydGlhbCBzdWNjZXNzIGlmIGFueSB0YWJsZSBmYWlsc1xuICAgICAgICBiYWNrdXBSZXN1bHRzLnB1c2goe1xuICAgICAgICAgIHRhYmxlLFxuICAgICAgICAgIHJlY29yZHM6IDAsIC8vIEluZGljYXRlIDAgcmVjb3JkcyBzdWNjZXNzZnVsbHkgYmFja2VkIHVwIGZvciB0aGlzIHRhYmxlXG4gICAgICAgICAgcGF0aDogYEVycm9yOiAke3RhYmxlRXJyb3IubWVzc2FnZX1gIC8vIExvZyB0aGUgZXJyb3IgbWVzc2FnZSBpbiB0aGUgcGF0aFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZWdpc3RlciB0aGUgYmFja3VwIG9wZXJhdGlvbiByZXN1bHQgKGV2ZW4gaWYgcGFydGlhbCBvciBmYWlsZWQpXG4gICAgIGNvbnN0IGJhY2t1cExvZzogQWRtaW5Mb2dJdGVtID0ge1xuICAgICAgICAgb3BlcmFjaW9uOiAnQkFDS1VQJyxcbiAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgdGFibGVzOiBiYWNrdXBSZXN1bHRzLCAvLyBMb2cgdGhlIHJlc3VsdHMgZm9yIGVhY2ggdGFibGUgYmFja3VwIGF0dGVtcHRcbiAgICAgICAgIC8vIEFkZCB1c2VyIGluZm8gaWYgYXZhaWxhYmxlXG4gICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgIC8vIEFzc3VtaW5nIGRiVXRpbHMucHV0SXRlbSB3b3Jrc1xuICAgICAgIGF3YWl0IGRiVXRpbHMucHV0SXRlbShTeXN0ZW1Db25maWdNb2RlbC5nZXRBZG1pbkxvZ3NUYWJsZSgpLCBiYWNrdXBMb2cpO1xuICAgICAgIGNvbnNvbGUubG9nKGDinIUgQmFja3VwIG9wZXJhdGlvbiBsb2dnZWQgdG8gJHtTeXN0ZW1Db25maWdNb2RlbC5nZXRBZG1pbkxvZ3NUYWJsZSgpfWApO1xuICAgIH0gY2F0Y2ggKGxvZ0Vycm9yOiBhbnkpIHtcbiAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgbG9nZ2luZyBiYWNrdXAgb3BlcmF0aW9uIHRvICR7U3lzdGVtQ29uZmlnTW9kZWwuZ2V0QWRtaW5Mb2dzVGFibGUoKX06YCwgbG9nRXJyb3IpO1xuICAgICAgIC8vIERlY2lkZSBob3cgdG8gaGFuZGxlIGxvZ2dpbmcgZmFpbHVyZSAodGhyb3cgb3IganVzdCB3YXJuKVxuICAgIH1cblxuXG4gICAgLy8gUmV0dXJuIEFQSSByZXNwb25zZVxuICAgIGNvbnN0IHJlc3BvbnNlUGF5bG9hZDogQmFja3VwSW5mb1BheWxvYWQgPSB7XG4gICAgICBzdGF0dXM6IG92ZXJhbGxTdGF0dXMsXG4gICAgICB0aW1lc3RhbXAsXG4gICAgICBkZXRhaWxzOiBiYWNrdXBSZXN1bHRzXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3BvbnNlTWVzc2FnZSA9IG92ZXJhbGxTdGF0dXMgPT09ICdzdWNjZXNzJyA/IFwiQmFja3VwIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHlcIiA6IFwiQmFja3VwIGNvbXBsZXRlZCB3aXRoIHNvbWUgZXJyb3JzXCI7XG5cbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2Uob3ZlcmFsbFN0YXR1cyA9PT0gJ3N1Y2Nlc3MnID8gMjAwIDogNTAwLCByZXNwb25zZU1lc3NhZ2UsIHJlc3BvbnNlUGF5bG9hZCk7XG5cbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkgeyAvLyBVc2UgJ2FueScgZm9yIGJyb2FkZXIgY29tcGF0aWJpbGl0eSB3aXRoIGVycm9yIHR5cGVzXG4gICAgY29uc29sZS5lcnJvcign4p2MIEVycm9yIGR1cmFudGUgZWwgcmVzcGFsZG8gZGUgZGF0b3M6JywgZXJyb3IpO1xuXG4gICAgLy8gTG9nIGEgZmFpbGVkIGJhY2t1cCBhdHRlbXB0XG4gICAgIGNvbnN0IGZhaWxlZEJhY2t1cExvZzogQWRtaW5Mb2dJdGVtID0ge1xuICAgICAgICAgb3BlcmFjaW9uOiAnQkFDS1VQX0ZBSUxFRCcsXG4gICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgIGRldGFpbHM6IHsgZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlIH1cbiAgICAgfTtcbiAgICB0cnkge1xuICAgICAgICAgYXdhaXQgZGJVdGlscy5wdXRJdGVtKFN5c3RlbUNvbmZpZ01vZGVsLmdldEFkbWluTG9nc1RhYmxlKCksIGZhaWxlZEJhY2t1cExvZyk7XG4gICAgfSBjYXRjaCAobG9nRXJyb3I6IGFueSkge1xuICAgICAgICAgY29uc29sZS5lcnJvcign4p2MIEZhaWxlZCB0byBsb2cgZmFpbGVkIGJhY2t1cCBvcGVyYXRpb246JywgbG9nRXJyb3IpO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBlcnJvciBBUEkgcmVzcG9uc2VcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBgRXJyb3IgYWwgcmVzcGFsZGFyIGRhdG9zOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gIH1cbn0iXX0=