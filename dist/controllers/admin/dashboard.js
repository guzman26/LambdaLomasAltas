"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemDashboard = getSystemDashboard;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Box_1 = __importDefault(require("../../models/Box"));
const Pallet_1 = __importDefault(require("../../models/Pallet"));
const Issue_1 = __importDefault(require("../../models/Issue"));
const response_1 = __importDefault(require("../../utils/response"));
const system_1 = require("./system");
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
/**
 * Obtiene un dashboard con métricas clave del sistema
 * @returns {Promise<ApiResponse>} API response with dashboard data
 */
async function getSystemDashboard() {
    try {
        // Obtenemos conteos de elementos en cada ubicación
        const [packingEggs, bodegaEggs, ventaEggs, pallets, issues] = await Promise.all([
            dynamoDB.scan({
                TableName: Box_1.default.getTableName(),
                IndexName: 'ubicacion-index',
                FilterExpression: 'ubicacion = :locationValue',
                ExpressionAttributeValues: { ':locationValue': 'PACKING' },
                Select: 'COUNT'
            }).promise(),
            dynamoDB.scan({
                TableName: Box_1.default.getTableName(),
                IndexName: 'ubicacion-index',
                FilterExpression: 'ubicacion = :locationValue',
                ExpressionAttributeValues: { ':locationValue': 'BODEGA' },
                Select: 'COUNT'
            }).promise(),
            dynamoDB.scan({
                TableName: Box_1.default.getTableName(),
                IndexName: 'ubicacion-index',
                FilterExpression: 'ubicacion = :locationValue',
                ExpressionAttributeValues: { ':locationValue': 'VENTA' },
                Select: 'COUNT'
            }).promise(),
            dynamoDB.scan({
                TableName: Pallet_1.default.getTableName(),
                Select: 'COUNT'
            }).promise(),
            dynamoDB.scan({
                TableName: Issue_1.default.getTableName(),
                Select: 'COUNT'
            }).promise()
        ]);
        // Obtener pallet activo
        const activePallet = await (0, system_1.getSystemConfig)('ACTIVE_PALLET_CODE');
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
        return (0, response_1.default)(200, "Dashboard data retrieved successfully", dashboard);
    }
    catch (error) {
        console.error('❌ Error al obtener dashboard del sistema:', error);
        return (0, response_1.default)(500, `Error al obtener métricas del sistema: ${error.message}`);
    }
}
exports.default = {
    getSystemDashboard
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFzaGJvYXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvYWRtaW4vZGFzaGJvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBaUNBLGdEQTREQztBQTdGRCxzREFBMEI7QUFHMUIsMkRBQW1DO0FBQ25DLGlFQUF5QztBQUN6QywrREFBdUM7QUFFdkMsb0VBQXFEO0FBQ3JELHFDQUEyQztBQUUzQyxNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBbUJuRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsa0JBQWtCO0lBQ3RDLElBQUksQ0FBQztRQUNILG1EQUFtRDtRQUNuRCxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUM5RSxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUNaLFNBQVMsRUFBRSxhQUFHLENBQUMsWUFBWSxFQUFFO2dCQUM3QixTQUFTLEVBQUUsaUJBQWlCO2dCQUM1QixnQkFBZ0IsRUFBRSw0QkFBNEI7Z0JBQzlDLHlCQUF5QixFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFO2dCQUMxRCxNQUFNLEVBQUUsT0FBTzthQUNoQixDQUFDLENBQUMsT0FBTyxFQUFFO1lBRVosUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDWixTQUFTLEVBQUUsYUFBRyxDQUFDLFlBQVksRUFBRTtnQkFDN0IsU0FBUyxFQUFFLGlCQUFpQjtnQkFDNUIsZ0JBQWdCLEVBQUUsNEJBQTRCO2dCQUM5Qyx5QkFBeUIsRUFBRSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRTtnQkFDekQsTUFBTSxFQUFFLE9BQU87YUFDaEIsQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUVaLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ1osU0FBUyxFQUFFLGFBQUcsQ0FBQyxZQUFZLEVBQUU7Z0JBQzdCLFNBQVMsRUFBRSxpQkFBaUI7Z0JBQzVCLGdCQUFnQixFQUFFLDRCQUE0QjtnQkFDOUMseUJBQXlCLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUU7Z0JBQ3hELE1BQU0sRUFBRSxPQUFPO2FBQ2hCLENBQUMsQ0FBQyxPQUFPLEVBQUU7WUFFWixRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUNaLFNBQVMsRUFBRSxnQkFBTSxDQUFDLFlBQVksRUFBRTtnQkFDaEMsTUFBTSxFQUFFLE9BQU87YUFDaEIsQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUVaLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ1osU0FBUyxFQUFFLGVBQUssQ0FBQyxZQUFZLEVBQUU7Z0JBQy9CLE1BQU0sRUFBRSxPQUFPO2FBQ2hCLENBQUMsQ0FBQyxPQUFPLEVBQUU7U0FDYixDQUFDLENBQUM7UUFFSCx3QkFBd0I7UUFDeEIsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLHdCQUFlLEVBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUVqRSxNQUFNLFNBQVMsR0FBa0I7WUFDL0IsS0FBSyxFQUFFO2dCQUNMLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxLQUFLLElBQUksQ0FBQztnQkFDekMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLEtBQUssSUFBSSxDQUFDO2dCQUN2QyxlQUFlLEVBQUUsU0FBUyxDQUFDLEtBQUssSUFBSSxDQUFDO2dCQUNyQyxhQUFhLEVBQUUsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDO2dCQUNqQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUM7YUFDckM7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sYUFBYSxFQUFFLFlBQVk7YUFDNUI7U0FDRixDQUFDO1FBRUYsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSx1Q0FBdUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEUsT0FBTyxJQUFBLGtCQUFpQixFQUFDLEdBQUcsRUFBRSwwQ0FBMkMsS0FBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDdEcsQ0FBQztBQUNILENBQUM7QUFFRCxrQkFBZTtJQUNiLGtCQUFrQjtDQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7IEFwaVJlc3BvbnNlIH0gZnJvbSAnLi4vLi4vdHlwZXMnO1xuaW1wb3J0IFN5c3RlbUNvbmZpZyBmcm9tICcuLi8uLi9tb2RlbHMvU3lzdGVtQ29uZmlnJztcbmltcG9ydCBCb3ggZnJvbSAnLi4vLi4vbW9kZWxzL0JveCc7XG5pbXBvcnQgUGFsbGV0IGZyb20gJy4uLy4uL21vZGVscy9QYWxsZXQnO1xuaW1wb3J0IElzc3VlIGZyb20gJy4uLy4uL21vZGVscy9Jc3N1ZSc7XG5pbXBvcnQgKiBhcyBkYlV0aWxzIGZyb20gJy4uLy4uL3V0aWxzL2RiJztcbmltcG9ydCBjcmVhdGVBcGlSZXNwb25zZSBmcm9tICcuLi8uLi91dGlscy9yZXNwb25zZSc7XG5pbXBvcnQgeyBnZXRTeXN0ZW1Db25maWcgfSBmcm9tICcuL3N5c3RlbSc7XG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG5pbnRlcmZhY2UgRGFzaGJvYXJkU3RhdHMge1xuICBodWV2b3NfZW5fcGFja2luZzogbnVtYmVyO1xuICBodWV2b3NfZW5fYm9kZWdhOiBudW1iZXI7XG4gIGh1ZXZvc19lbl92ZW50YTogbnVtYmVyO1xuICB0b3RhbF9wYWxsZXRzOiBudW1iZXI7XG4gIGlzc3Vlc19wZW5kaWVudGVzOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYXNoYm9hcmRDb25maWcge1xuICBwYWxsZXRfYWN0aXZvOiBzdHJpbmcgfCBudWxsO1xufVxuXG5pbnRlcmZhY2UgRGFzaGJvYXJkRGF0YSB7XG4gIHN0YXRzOiBEYXNoYm9hcmRTdGF0cztcbiAgY29uZmlnOiBEYXNoYm9hcmRDb25maWc7XG59XG5cbi8qKlxuICogT2J0aWVuZSB1biBkYXNoYm9hcmQgY29uIG3DqXRyaWNhcyBjbGF2ZSBkZWwgc2lzdGVtYVxuICogQHJldHVybnMge1Byb21pc2U8QXBpUmVzcG9uc2U+fSBBUEkgcmVzcG9uc2Ugd2l0aCBkYXNoYm9hcmQgZGF0YVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3lzdGVtRGFzaGJvYXJkKCk6IFByb21pc2U8QXBpUmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICAvLyBPYnRlbmVtb3MgY29udGVvcyBkZSBlbGVtZW50b3MgZW4gY2FkYSB1YmljYWNpw7NuXG4gICAgY29uc3QgW3BhY2tpbmdFZ2dzLCBib2RlZ2FFZ2dzLCB2ZW50YUVnZ3MsIHBhbGxldHMsIGlzc3Vlc10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICBkeW5hbW9EQi5zY2FuKHtcbiAgICAgICAgVGFibGVOYW1lOiBCb3guZ2V0VGFibGVOYW1lKCksXG4gICAgICAgIEluZGV4TmFtZTogJ3ViaWNhY2lvbi1pbmRleCcsXG4gICAgICAgIEZpbHRlckV4cHJlc3Npb246ICd1YmljYWNpb24gPSA6bG9jYXRpb25WYWx1ZScsXG4gICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHsgJzpsb2NhdGlvblZhbHVlJzogJ1BBQ0tJTkcnIH0sXG4gICAgICAgIFNlbGVjdDogJ0NPVU5UJ1xuICAgICAgfSkucHJvbWlzZSgpLFxuICAgICAgXG4gICAgICBkeW5hbW9EQi5zY2FuKHtcbiAgICAgICAgVGFibGVOYW1lOiBCb3guZ2V0VGFibGVOYW1lKCksXG4gICAgICAgIEluZGV4TmFtZTogJ3ViaWNhY2lvbi1pbmRleCcsXG4gICAgICAgIEZpbHRlckV4cHJlc3Npb246ICd1YmljYWNpb24gPSA6bG9jYXRpb25WYWx1ZScsXG4gICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHsgJzpsb2NhdGlvblZhbHVlJzogJ0JPREVHQScgfSxcbiAgICAgICAgU2VsZWN0OiAnQ09VTlQnXG4gICAgICB9KS5wcm9taXNlKCksXG4gICAgICBcbiAgICAgIGR5bmFtb0RCLnNjYW4oe1xuICAgICAgICBUYWJsZU5hbWU6IEJveC5nZXRUYWJsZU5hbWUoKSxcbiAgICAgICAgSW5kZXhOYW1lOiAndWJpY2FjaW9uLWluZGV4JyxcbiAgICAgICAgRmlsdGVyRXhwcmVzc2lvbjogJ3ViaWNhY2lvbiA9IDpsb2NhdGlvblZhbHVlJyxcbiAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogeyAnOmxvY2F0aW9uVmFsdWUnOiAnVkVOVEEnIH0sXG4gICAgICAgIFNlbGVjdDogJ0NPVU5UJ1xuICAgICAgfSkucHJvbWlzZSgpLFxuICAgICAgXG4gICAgICBkeW5hbW9EQi5zY2FuKHtcbiAgICAgICAgVGFibGVOYW1lOiBQYWxsZXQuZ2V0VGFibGVOYW1lKCksXG4gICAgICAgIFNlbGVjdDogJ0NPVU5UJ1xuICAgICAgfSkucHJvbWlzZSgpLFxuICAgICAgXG4gICAgICBkeW5hbW9EQi5zY2FuKHtcbiAgICAgICAgVGFibGVOYW1lOiBJc3N1ZS5nZXRUYWJsZU5hbWUoKSxcbiAgICAgICAgU2VsZWN0OiAnQ09VTlQnXG4gICAgICB9KS5wcm9taXNlKClcbiAgICBdKTtcblxuICAgIC8vIE9idGVuZXIgcGFsbGV0IGFjdGl2b1xuICAgIGNvbnN0IGFjdGl2ZVBhbGxldCA9IGF3YWl0IGdldFN5c3RlbUNvbmZpZygnQUNUSVZFX1BBTExFVF9DT0RFJyk7XG5cbiAgICBjb25zdCBkYXNoYm9hcmQ6IERhc2hib2FyZERhdGEgPSB7XG4gICAgICBzdGF0czoge1xuICAgICAgICBodWV2b3NfZW5fcGFja2luZzogcGFja2luZ0VnZ3MuQ291bnQgfHwgMCxcbiAgICAgICAgaHVldm9zX2VuX2JvZGVnYTogYm9kZWdhRWdncy5Db3VudCB8fCAwLFxuICAgICAgICBodWV2b3NfZW5fdmVudGE6IHZlbnRhRWdncy5Db3VudCB8fCAwLFxuICAgICAgICB0b3RhbF9wYWxsZXRzOiBwYWxsZXRzLkNvdW50IHx8IDAsXG4gICAgICAgIGlzc3Vlc19wZW5kaWVudGVzOiBpc3N1ZXMuQ291bnQgfHwgMFxuICAgICAgfSxcbiAgICAgIGNvbmZpZzoge1xuICAgICAgICBwYWxsZXRfYWN0aXZvOiBhY3RpdmVQYWxsZXRcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGNyZWF0ZUFwaVJlc3BvbnNlKDIwMCwgXCJEYXNoYm9hcmQgZGF0YSByZXRyaWV2ZWQgc3VjY2Vzc2Z1bGx5XCIsIGRhc2hib2FyZCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcign4p2MIEVycm9yIGFsIG9idGVuZXIgZGFzaGJvYXJkIGRlbCBzaXN0ZW1hOicsIGVycm9yKTtcbiAgICByZXR1cm4gY3JlYXRlQXBpUmVzcG9uc2UoNTAwLCBgRXJyb3IgYWwgb2J0ZW5lciBtw6l0cmljYXMgZGVsIHNpc3RlbWE6ICR7KGVycm9yIGFzIEVycm9yKS5tZXNzYWdlfWApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZ2V0U3lzdGVtRGFzaGJvYXJkXG59OyAiXX0=