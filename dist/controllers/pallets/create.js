"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPallet = createPallet;
const dynamoDb_1 = __importDefault(require("../../utils/dynamoDb"));
const SystemConfig_1 = __importDefault(require("../../models/SystemConfig"));
const LOCATIONS = SystemConfig_1.default.getLocations();
/**
 * Creates a new pallet in the database
 * @param codigo - The pallet code
 * @returns The created pallet object
 */
async function createPallet(codigo) {
    const now = new Date().toISOString();
    const pallet = {
        codigo,
        fechaCalibreFormato: codigo.substring(0, 9),
        estado: 'open',
        cajas: [],
        cantidadCajas: 0,
        fechaCreacion: now,
        ubicacion: LOCATIONS.TRANSITO
    };
    await dynamoDb_1.default.put({
        TableName: process.env.PALLETS_TABLE || 'Pallets',
        Item: pallet
    });
    return pallet;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvcGFsbGV0cy9jcmVhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFrQ0Usb0NBQVk7QUFqQ2Qsb0VBQTRDO0FBRTVDLDZFQUFxRDtBQUVyRCxNQUFNLFNBQVMsR0FBRyxzQkFBWSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBRTlDOzs7O0dBSUc7QUFDSCxLQUFLLFVBQVUsWUFBWSxDQUFDLE1BQWM7SUFDeEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUVyQyxNQUFNLE1BQU0sR0FBVztRQUNyQixNQUFNO1FBQ04sbUJBQW1CLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sRUFBRSxNQUFNO1FBQ2QsS0FBSyxFQUFFLEVBQUU7UUFDVCxhQUFhLEVBQUUsQ0FBQztRQUNoQixhQUFhLEVBQUUsR0FBRztRQUNsQixTQUFTLEVBQUUsU0FBUyxDQUFDLFFBQVE7S0FDOUIsQ0FBQztJQUVGLE1BQU0sa0JBQVEsQ0FBQyxHQUFHLENBQUM7UUFDakIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLFNBQVM7UUFDakQsSUFBSSxFQUFFLE1BQU07S0FDYixDQUFDLENBQUM7SUFFSCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgZHluYW1vRGIgZnJvbSAnLi4vLi4vdXRpbHMvZHluYW1vRGInO1xuaW1wb3J0IHsgUGFsbGV0LCBMb2NhdGlvbiB9IGZyb20gJy4uLy4uL3R5cGVzJztcbmltcG9ydCBTeXN0ZW1Db25maWcgZnJvbSAnLi4vLi4vbW9kZWxzL1N5c3RlbUNvbmZpZyc7XG5cbmNvbnN0IExPQ0FUSU9OUyA9IFN5c3RlbUNvbmZpZy5nZXRMb2NhdGlvbnMoKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHBhbGxldCBpbiB0aGUgZGF0YWJhc2VcbiAqIEBwYXJhbSBjb2RpZ28gLSBUaGUgcGFsbGV0IGNvZGVcbiAqIEByZXR1cm5zIFRoZSBjcmVhdGVkIHBhbGxldCBvYmplY3RcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlUGFsbGV0KGNvZGlnbzogc3RyaW5nKTogUHJvbWlzZTxQYWxsZXQ+IHtcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICBcbiAgY29uc3QgcGFsbGV0OiBQYWxsZXQgPSB7XG4gICAgY29kaWdvLFxuICAgIGZlY2hhQ2FsaWJyZUZvcm1hdG86IGNvZGlnby5zdWJzdHJpbmcoMCwgOSksXG4gICAgZXN0YWRvOiAnb3BlbicsXG4gICAgY2FqYXM6IFtdLFxuICAgIGNhbnRpZGFkQ2FqYXM6IDAsXG4gICAgZmVjaGFDcmVhY2lvbjogbm93LFxuICAgIHViaWNhY2lvbjogTE9DQVRJT05TLlRSQU5TSVRPXG4gIH07XG5cbiAgYXdhaXQgZHluYW1vRGIucHV0KHtcbiAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBBTExFVFNfVEFCTEUgfHwgJ1BhbGxldHMnLFxuICAgIEl0ZW06IHBhbGxldFxuICB9KTtcblxuICByZXR1cm4gcGFsbGV0O1xufVxuXG5leHBvcnQge1xuICBjcmVhdGVQYWxsZXRcbn07ICJdfQ==