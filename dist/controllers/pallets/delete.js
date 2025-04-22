"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dynamoDb_1 = __importDefault(require("../../utils/dynamoDb"));
/**
 * Deletes a pallet from the database
 * @param codigo - The pallet code to delete
 * @returns Result of the deletion operation
 */
async function deletePallet(codigo) {
    // Check if pallet exists
    const { Item: pallet } = await dynamoDb_1.default.get({
        TableName: process.env.PALLETS_TABLE || 'Pallets',
        Key: { codigo }
    });
    if (!pallet) {
        throw new Error(`Pallet with codigo ${codigo} not found`);
    }
    // Check if pallet has boxes
    if (pallet.boxes && pallet.boxes.length > 0) {
        throw new Error(`Cannot delete pallet ${codigo} because it contains ${pallet.boxes.length} boxes`);
    }
    // Delete the pallet
    await dynamoDb_1.default.delete({
        TableName: process.env.PALLETS_TABLE || 'Pallets',
        Key: { codigo }
    });
    return {
        success: true,
        message: `Pallet ${codigo} has been deleted successfully`
    };
}
exports.default = deletePallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvcGFsbGV0cy9kZWxldGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvRUFBNEM7QUFPNUM7Ozs7R0FJRztBQUNILEtBQUssVUFBVSxZQUFZLENBQUMsTUFBYztJQUN4Qyx5QkFBeUI7SUFDekIsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLGtCQUFRLENBQUMsR0FBRyxDQUFDO1FBQzFDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTO1FBQ2pELEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRTtLQUNoQixDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixNQUFNLFlBQVksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCw0QkFBNEI7SUFDNUIsSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzVDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLE1BQU0sd0JBQXdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUMsQ0FBQztJQUNyRyxDQUFDO0lBRUQsb0JBQW9CO0lBQ3BCLE1BQU0sa0JBQVEsQ0FBQyxNQUFNLENBQUM7UUFDcEIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLFNBQVM7UUFDakQsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFO0tBQ2hCLENBQUMsQ0FBQztJQUVILE9BQU87UUFDTCxPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxVQUFVLE1BQU0sZ0NBQWdDO0tBQzFELENBQUM7QUFDSixDQUFDO0FBRUQsa0JBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGR5bmFtb0RiIGZyb20gJy4uLy4uL3V0aWxzL2R5bmFtb0RiJztcblxuaW50ZXJmYWNlIERlbGV0ZVJlc3VsdCB7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIG1lc3NhZ2U6IHN0cmluZztcbn1cblxuLyoqXG4gKiBEZWxldGVzIGEgcGFsbGV0IGZyb20gdGhlIGRhdGFiYXNlXG4gKiBAcGFyYW0gY29kaWdvIC0gVGhlIHBhbGxldCBjb2RlIHRvIGRlbGV0ZVxuICogQHJldHVybnMgUmVzdWx0IG9mIHRoZSBkZWxldGlvbiBvcGVyYXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVsZXRlUGFsbGV0KGNvZGlnbzogc3RyaW5nKTogUHJvbWlzZTxEZWxldGVSZXN1bHQ+IHtcbiAgLy8gQ2hlY2sgaWYgcGFsbGV0IGV4aXN0c1xuICBjb25zdCB7IEl0ZW06IHBhbGxldCB9ID0gYXdhaXQgZHluYW1vRGIuZ2V0KHtcbiAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBBTExFVFNfVEFCTEUgfHwgJ1BhbGxldHMnLFxuICAgIEtleTogeyBjb2RpZ28gfVxuICB9KTtcblxuICBpZiAoIXBhbGxldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgUGFsbGV0IHdpdGggY29kaWdvICR7Y29kaWdvfSBub3QgZm91bmRgKTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHBhbGxldCBoYXMgYm94ZXNcbiAgaWYgKHBhbGxldC5ib3hlcyAmJiBwYWxsZXQuYm94ZXMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGRlbGV0ZSBwYWxsZXQgJHtjb2RpZ299IGJlY2F1c2UgaXQgY29udGFpbnMgJHtwYWxsZXQuYm94ZXMubGVuZ3RofSBib3hlc2ApO1xuICB9XG5cbiAgLy8gRGVsZXRlIHRoZSBwYWxsZXRcbiAgYXdhaXQgZHluYW1vRGIuZGVsZXRlKHtcbiAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LlBBTExFVFNfVEFCTEUgfHwgJ1BhbGxldHMnLFxuICAgIEtleTogeyBjb2RpZ28gfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgbWVzc2FnZTogYFBhbGxldCAke2NvZGlnb30gaGFzIGJlZW4gZGVsZXRlZCBzdWNjZXNzZnVsbHlgXG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlbGV0ZVBhbGxldDsgIl19