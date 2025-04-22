"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIssues = getIssues;
exports.updateIssueStatus = updateIssueStatus;
exports.deleteIssue = deleteIssue;
// controllers/issues/index.ts
const dynamodb_1 = require("aws-sdk/clients/dynamodb");
const Issue_1 = __importDefault(require("../../models/Issue"));
const SystemConfig_1 = __importDefault(require("../../models/SystemConfig"));
const db_1 = __importDefault(require("../../utils/db"));
const response_1 = __importDefault(require("../../utils/response"));
const dynamoDB = new dynamodb_1.DocumentClient();
/* ------------------------------------------------------------------ */
/*  Implementación                                                    */
/* ------------------------------------------------------------------ */
/**
 * Obtiene la lista de incidencias con filtros opcionales.
 */
async function getIssues(options = {}) {
    try {
        const filterExp = [];
        const exprVals = {};
        if (options.status) {
            filterExp.push('#status = :status');
            exprVals[':status'] = options.status;
        }
        if (options.startDate) {
            filterExp.push('timestamp >= :startDate');
            exprVals[':startDate'] = options.startDate;
        }
        if (options.endDate) {
            filterExp.push('timestamp <= :endDate');
            exprVals[':endDate'] = options.endDate;
        }
        const items = await db_1.default.scanItems(Issue_1.default.getTableName(), filterExp.length ? filterExp.join(' AND ') : undefined, Object.keys(exprVals).length ? exprVals : undefined, { '#status': 'status' });
        return (0, response_1.default)(200, 'Issues retrieved successfully', items);
    }
    catch (err) {
        console.error('❌ Error al obtener problemas:', err);
        return (0, response_1.default)(500, `Error al obtener problemas: ${err.message}`);
    }
}
/**
 * Actualiza el estado de una incidencia.
 */
async function updateIssueStatus({ issueId, status, resolution = null, }) {
    try {
        if (!Issue_1.default.isValidStatus(status)) {
            return (0, response_1.default)(400, `Estado inválido. Debe ser ${Issue_1.default.getStatusValues().join(', ')}`);
        }
        let updateExpr = 'SET #status = :status, lastUpdated = :ts';
        const exprNames = { '#status': 'status' };
        const exprVals = {
            ':status': status,
            ':ts': new Date().toISOString(),
        };
        if (resolution && status === 'RESOLVED') {
            updateExpr += ', resolution = :resolution';
            exprVals[':resolution'] = resolution;
        }
        const updated = await db_1.default.updateItem(Issue_1.default.getTableName(), { IssueNumber: issueId }, updateExpr, exprVals, exprNames);
        if (!updated) {
            return (0, response_1.default)(404, `No se encontró el issue ${issueId}`);
        }
        return (0, response_1.default)(200, 'Issue status updated', updated);
    }
    catch (err) {
        console.error(`❌ Error actualizando issue ${issueId}:`, err);
        return (0, response_1.default)(500, `Error al actualizar estado: ${err.message}`);
    }
}
/**
 * Elimina una incidencia.
 */
async function deleteIssue(issueId) {
    try {
        if (!issueId) {
            return (0, response_1.default)(400, 'ID de incidencia es requerido');
        }
        // Verifica existencia
        const existing = await db_1.default.getItem(Issue_1.default.getTableName(), {
            IssueNumber: issueId,
        });
        if (!existing) {
            return (0, response_1.default)(404, `No se encontró la incidencia ${issueId}`);
        }
        // Elimina
        const deleted = await db_1.default.deleteItem(Issue_1.default.getTableName(), {
            IssueNumber: issueId,
        });
        // Registra en logs de administración
        await db_1.default.putItem(SystemConfig_1.default.getAdminLogsTable(), {
            operacion: 'DELETE_ISSUE',
            timestamp: new Date().toISOString(),
            issueId,
            deletedItem: deleted,
            usuario: 'ADMIN', // TODO: obtener del contexto auth
        });
        return (0, response_1.default)(200, `Issue ${issueId} eliminado`, {
            deleted: true,
        });
    }
    catch (err) {
        console.error(`❌ Error eliminando issue ${issueId}:`, err);
        return (0, response_1.default)(500, `Error al eliminar: ${err.message}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvYWRtaW4vaXNzdWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBa0NBLDhCQWdDQztBQUtELDhDQTZDQztBQUtELGtDQXFDQztBQTlKRCw4QkFBOEI7QUFDOUIsdURBQTBEO0FBQzFELCtEQUF1QztBQUN2Qyw2RUFBcUQ7QUFDckQsd0RBQXFDO0FBQ3JDLG9FQUFxRDtBQUdyRCxNQUFNLFFBQVEsR0FBRyxJQUFJLHlCQUFjLEVBQUUsQ0FBQztBQW1CdEMsd0VBQXdFO0FBQ3hFLHdFQUF3RTtBQUN4RSx3RUFBd0U7QUFFeEU7O0dBRUc7QUFDSSxLQUFLLFVBQVUsU0FBUyxDQUM3QixVQUE0QixFQUFFO0lBRTlCLElBQUksQ0FBQztRQUNILE1BQU0sU0FBUyxHQUFhLEVBQUUsQ0FBQztRQUMvQixNQUFNLFFBQVEsR0FBNEIsRUFBRSxDQUFDO1FBRTdDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ25CLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNwQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUN2QyxDQUFDO1FBQ0QsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdEIsU0FBUyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQzFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1FBQzdDLENBQUM7UUFDRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwQixTQUFTLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDeEMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDekMsQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLE1BQU0sWUFB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QUFDLFlBQVksRUFBRSxFQUFFO1lBQzNELFdBQVcsRUFBRSxPQUFPO1NBQ3JCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNkLE9BQU8sSUFBQSxrQkFBaUIsRUFBQyxHQUFHLEVBQUUsZ0NBQWdDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVELFVBQVU7UUFDVixNQUFNLE9BQU8sR0FBRyxNQUFNLFlBQU8sQ0FBQyxVQUFVLENBQUMsZUFBSyxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQzdELFdBQVcsRUFBRSxPQUFPO1NBQ3JCLENBQUMsQ0FBQztRQUVILHFDQUFxQztRQUNyQyxNQUFNLFlBQU8sQ0FBQyxPQUFPLENBQUMsc0JBQVksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1lBQ3RELFNBQVMsRUFBRSxjQUFjO1lBQ3pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtZQUNuQyxPQUFPO1lBQ1AsV0FBVyxFQUFFLE9BQU87WUFDcEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxrQ0FBa0M7U0FDckQsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxTQUFTLE9BQU8sWUFBWSxFQUFFO1lBQzFELE9BQU8sRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsT0FBTyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0QsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSxzQkFBc0IsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDckUsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjb250cm9sbGVycy9pc3N1ZXMvaW5kZXgudHNcbmltcG9ydCB7IERvY3VtZW50Q2xpZW50IH0gZnJvbSAnYXdzLXNkay9jbGllbnRzL2R5bmFtb2RiJztcbmltcG9ydCBJc3N1ZSBmcm9tICcuLi8uLi9tb2RlbHMvSXNzdWUnO1xuaW1wb3J0IFN5c3RlbUNvbmZpZyBmcm9tICcuLi8uLi9tb2RlbHMvU3lzdGVtQ29uZmlnJztcbmltcG9ydCBkYlV0aWxzIGZyb20gJy4uLy4uL3V0aWxzL2RiJztcbmltcG9ydCBjcmVhdGVBcGlSZXNwb25zZSBmcm9tICcuLi8uLi91dGlscy9yZXNwb25zZSc7XG5pbXBvcnQgeyBBcGlSZXNwb25zZSwgSXNzdWVTdGF0dXMgfSBmcm9tICcuLi8uLi90eXBlcyc7XG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IERvY3VtZW50Q2xpZW50KCk7XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuLyogIFRpcG9zIGF1eGlsaWFyZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0SXNzdWVzT3B0aW9ucyB7XG4gIHN0YXR1cz86IElzc3VlU3RhdHVzO1xuICAvKiogSVNP4oCRODYwMSBvIHRpbWVzdGFtcCBxdWUgdHUgYmFja2VuZCBlbnRpZW5kYSAgICAgICAgICAgICAgICovXG4gIHN0YXJ0RGF0ZT86IHN0cmluZztcbiAgZW5kRGF0ZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBVcGRhdGVJc3N1ZUlucHV0IHtcbiAgaXNzdWVJZDogc3RyaW5nO1xuICBzdGF0dXM6IElzc3VlU3RhdHVzO1xuICByZXNvbHV0aW9uPzogc3RyaW5nIHwgbnVsbDtcbn1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG4vKiAgSW1wbGVtZW50YWNpw7NuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuLyoqXG4gKiBPYnRpZW5lIGxhIGxpc3RhIGRlIGluY2lkZW5jaWFzIGNvbiBmaWx0cm9zIG9wY2lvbmFsZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRJc3N1ZXMoXG4gIG9wdGlvbnM6IEdldElzc3Vlc09wdGlvbnMgPSB7fSxcbik6IFByb21pc2U8QXBpUmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmaWx0ZXJFeHA6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgZXhwclZhbHM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbiAgICBpZiAob3B0aW9ucy5zdGF0dXMpIHtcbiAgICAgIGZpbHRlckV4cC5wdXNoKCcjc3RhdHVzID0gOnN0YXR1cycpO1xuICAgICAgZXhwclZhbHNbJzpzdGF0dXMnXSA9IG9wdGlvbnMuc3RhdHVzO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5zdGFydERhdGUpIHtcbiAgICAgIGZpbHRlckV4cC5wdXNoKCd0aW1lc3RhbXAgPj0gOnN0YXJ0RGF0ZScpO1xuICAgICAgZXhwclZhbHNbJzpzdGFydERhdGUnXSA9IG9wdGlvbnMuc3RhcnREYXRlO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5lbmREYXRlKSB7XG4gICAgICBmaWx0ZXJFeHAucHVzaCgndGltZXN0YW1wIDw9IDplbmREYXRlJyk7XG4gICAgICBleHByVmFsc1snOmVuZERhdGUnXSA9IG9wdGlvbnMuZW5kRGF0ZTtcbiAgICB9XG5cbiAgICBjb25zdCBpdGVtcyA9IGF3YWl0IGRiVXRpbHMuc2Nhbkl0ZW1zKFxuICAgICAgSXNzdWUuZ2V0VGFibGVOYW1lKCksXG4gICAgICBmaWx0ZXJFeHAubGVuZ3RoID8gZmlsdGVyRXhwLmpvaW4oJyBBTkQgJykgOiB1bmRlZmluZWQsXG4gICAgICBPYmplY3Qua2V5cyhleHByVmFscykubGVuZ3RoID8gZXhwclZhbHMgOiB1bmRlZmluZWQsXG4gICAgICB7ICcjc3RhdHVzJzogJ3N0YXR1cycgfSwgLy8gRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzXG4gICAgKTtcblxuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsICdJc3N1ZXMgcmV0cmlldmVkIHN1Y2Nlc3NmdWxseScsIGl0ZW1zKTtcbiAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgYWwgb2J0ZW5lciBwcm9ibGVtYXM6JywgZXJyKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBgRXJyb3IgYWwgb2J0ZW5lciBwcm9ibGVtYXM6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBY3R1YWxpemEgZWwgZXN0YWRvIGRlIHVuYSBpbmNpZGVuY2lhLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlSXNzdWVTdGF0dXMoe1xuICBpc3N1ZUlkLFxuICBzdGF0dXMsXG4gIHJlc29sdXRpb24gPSBudWxsLFxufTogVXBkYXRlSXNzdWVJbnB1dCk6IFByb21pc2U8QXBpUmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBpZiAoIUlzc3VlLmlzVmFsaWRTdGF0dXMoc3RhdHVzKSkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKFxuICAgICAgICA0MDAsXG4gICAgICAgIGBFc3RhZG8gaW52w6FsaWRvLiBEZWJlIHNlciAke0lzc3VlLmdldFN0YXR1c1ZhbHVlcygpLmpvaW4oJywgJyl9YCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHVwZGF0ZUV4cHIgPSAnU0VUICNzdGF0dXMgPSA6c3RhdHVzLCBsYXN0VXBkYXRlZCA9IDp0cyc7XG4gICAgY29uc3QgZXhwck5hbWVzID0geyAnI3N0YXR1cyc6ICdzdGF0dXMnIH07XG4gICAgY29uc3QgZXhwclZhbHM6IERvY3VtZW50Q2xpZW50LkV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZU1hcCA9IHtcbiAgICAgICc6c3RhdHVzJzogc3RhdHVzLFxuICAgICAgJzp0cyc6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9O1xuXG4gICAgaWYgKHJlc29sdXRpb24gJiYgc3RhdHVzID09PSAnUkVTT0xWRUQnKSB7XG4gICAgICB1cGRhdGVFeHByICs9ICcsIHJlc29sdXRpb24gPSA6cmVzb2x1dGlvbic7XG4gICAgICBleHByVmFsc1snOnJlc29sdXRpb24nXSA9IHJlc29sdXRpb247XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlZCA9IGF3YWl0IGRiVXRpbHMudXBkYXRlSXRlbShcbiAgICAgIElzc3VlLmdldFRhYmxlTmFtZSgpLFxuICAgICAgeyBJc3N1ZU51bWJlcjogaXNzdWVJZCB9LFxuICAgICAgdXBkYXRlRXhwcixcbiAgICAgIGV4cHJWYWxzLFxuICAgICAgZXhwck5hbWVzLFxuICAgICk7XG5cbiAgICBpZiAoIXVwZGF0ZWQpIHtcbiAgICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg0MDQsIGBObyBzZSBlbmNvbnRyw7MgZWwgaXNzdWUgJHtpc3N1ZUlkfWApO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSgyMDAsICdJc3N1ZSBzdGF0dXMgdXBkYXRlZCcsIHVwZGF0ZWQpO1xuICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciBhY3R1YWxpemFuZG8gaXNzdWUgJHtpc3N1ZUlkfTpgLCBlcnIpO1xuICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZShcbiAgICAgIDUwMCxcbiAgICAgIGBFcnJvciBhbCBhY3R1YWxpemFyIGVzdGFkbzogJHtlcnIubWVzc2FnZX1gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBFbGltaW5hIHVuYSBpbmNpZGVuY2lhLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlSXNzdWUoXG4gIGlzc3VlSWQ6IHN0cmluZyxcbik6IFByb21pc2U8QXBpUmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBpZiAoIWlzc3VlSWQpIHtcbiAgICAgIHJldHVybiBjcmVhdGVBcGlSZXNwb25zZSg0MDAsICdJRCBkZSBpbmNpZGVuY2lhIGVzIHJlcXVlcmlkbycpO1xuICAgIH1cblxuICAgIC8vIFZlcmlmaWNhIGV4aXN0ZW5jaWFcbiAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGRiVXRpbHMuZ2V0SXRlbShJc3N1ZS5nZXRUYWJsZU5hbWUoKSwge1xuICAgICAgSXNzdWVOdW1iZXI6IGlzc3VlSWQsXG4gICAgfSk7XG4gICAgaWYgKCFleGlzdGluZykge1xuICAgICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDQwNCwgYE5vIHNlIGVuY29udHLDsyBsYSBpbmNpZGVuY2lhICR7aXNzdWVJZH1gKTtcbiAgICB9XG5cbiAgICAvLyBFbGltaW5hXG4gICAgY29uc3QgZGVsZXRlZCA9IGF3YWl0IGRiVXRpbHMuZGVsZXRlSXRlbShJc3N1ZS5nZXRUYWJsZU5hbWUoKSwge1xuICAgICAgSXNzdWVOdW1iZXI6IGlzc3VlSWQsXG4gICAgfSk7XG5cbiAgICAvLyBSZWdpc3RyYSBlbiBsb2dzIGRlIGFkbWluaXN0cmFjacOzblxuICAgIGF3YWl0IGRiVXRpbHMucHV0SXRlbShTeXN0ZW1Db25maWcuZ2V0QWRtaW5Mb2dzVGFibGUoKSwge1xuICAgICAgb3BlcmFjaW9uOiAnREVMRVRFX0lTU1VFJyxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgaXNzdWVJZCxcbiAgICAgIGRlbGV0ZWRJdGVtOiBkZWxldGVkLFxuICAgICAgdXN1YXJpbzogJ0FETUlOJywgLy8gVE9ETzogb2J0ZW5lciBkZWwgY29udGV4dG8gYXV0aFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgYElzc3VlICR7aXNzdWVJZH0gZWxpbWluYWRvYCwge1xuICAgICAgZGVsZXRlZDogdHJ1ZSxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgZWxpbWluYW5kbyBpc3N1ZSAke2lzc3VlSWR9OmAsIGVycik7XG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDUwMCwgYEVycm9yIGFsIGVsaW1pbmFyOiAke2Vyci5tZXNzYWdlfWApO1xuICB9XG59XG4iXX0=