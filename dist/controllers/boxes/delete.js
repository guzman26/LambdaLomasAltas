"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Box_1 = __importDefault(require("../../models/Box"));
const Pallet_1 = __importDefault(require("../../models/Pallet"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
/**
 * Deletes a box record from the database and updates the associated pallet
 *
 * @param {string} codigo - The codigo of the box to delete
 * @returns {Promise<DeleteResult>} - The deletion result
 */
const deleteBox = async (codigo) => {
    try {
        // 1. Get the box to check existence and associated pallet
        const getBoxParams = {
            TableName: Box_1.default.getTableName(),
            Key: { codigo: codigo }
        };
        const boxResult = await dynamoDB.get(getBoxParams).promise();
        const box = boxResult.Item;
        if (!box) {
            return {
                success: false,
                message: `La caja con código ${codigo} no existe`
            };
        }
        // 2. If the box is assigned to a pallet, update the pallet
        if (box.palletId) {
            const getPalletParams = {
                TableName: Pallet_1.default.getTableName(),
                Key: { codigo: box.palletId }
            };
            const palletResult = await dynamoDB.get(getPalletParams).promise();
            const pallet = palletResult.Item;
            if (pallet) {
                // Remove the box from the pallet's box list
                const updatedBoxes = pallet.cajas.filter((item) => item !== codigo);
                // Update the pallet
                const updatePalletParams = {
                    TableName: Pallet_1.default.getTableName(),
                    Key: { codigo: box.palletId },
                    UpdateExpression: 'SET cajas = :boxes, cantidadCajas = :newCount',
                    ExpressionAttributeValues: {
                        ':boxes': updatedBoxes,
                        ':newCount': Math.max(0, pallet.cantidadCajas - 1)
                    }
                };
                await dynamoDB.update(updatePalletParams).promise();
            }
        }
        // 3. Delete the box from the database
        const deleteBoxParams = {
            TableName: Box_1.default.getTableName(),
            Key: { codigo: codigo }
        };
        await dynamoDB.delete(deleteBoxParams).promise();
        return {
            success: true,
            message: `Caja ${codigo} eliminada con éxito`
        };
    }
    catch (error) {
        console.error(`Error deleting box ${codigo}:`, error);
        return {
            success: false,
            message: `Error al eliminar la caja: ${error.message}`
        };
    }
};
exports.default = deleteBox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvYm94ZXMvZGVsZXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQTBCO0FBRTFCLDJEQUF3QztBQUN4QyxpRUFBOEM7QUFFOUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxpQkFBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQU9uRDs7Ozs7R0FLRztBQUNILE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxNQUFjLEVBQXlCLEVBQUU7SUFDaEUsSUFBSSxDQUFDO1FBQ0gsMERBQTBEO1FBQzFELE1BQU0sWUFBWSxHQUFHO1lBQ25CLFNBQVMsRUFBRSxhQUFRLENBQUMsWUFBWSxFQUFFO1lBQ2xDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7U0FDeEIsQ0FBQztRQUVGLE1BQU0sU0FBUyxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM3RCxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsSUFBdUIsQ0FBQztRQUU5QyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDVCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU8sRUFBRSxzQkFBc0IsTUFBTSxZQUFZO2FBQ2xELENBQUM7UUFDSixDQUFDO1FBRUQsMkRBQTJEO1FBQzNELElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLE1BQU0sZUFBZSxHQUFHO2dCQUN0QixTQUFTLEVBQUUsZ0JBQVcsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3JDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFO2FBQzlCLENBQUM7WUFFRixNQUFNLFlBQVksR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbkUsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQztZQUVqQyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNYLDRDQUE0QztnQkFDNUMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQztnQkFFNUUsb0JBQW9CO2dCQUNwQixNQUFNLGtCQUFrQixHQUFHO29CQUN6QixTQUFTLEVBQUUsZ0JBQVcsQ0FBQyxZQUFZLEVBQUU7b0JBQ3JDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFO29CQUM3QixnQkFBZ0IsRUFBRSwrQ0FBK0M7b0JBQ2pFLHlCQUF5QixFQUFFO3dCQUN6QixRQUFRLEVBQUUsWUFBWTt3QkFDdEIsV0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO3FCQUNuRDtpQkFDRixDQUFDO2dCQUVGLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RELENBQUM7UUFDSCxDQUFDO1FBRUQsc0NBQXNDO1FBQ3RDLE1BQU0sZUFBZSxHQUFHO1lBQ3RCLFNBQVMsRUFBRSxhQUFRLENBQUMsWUFBWSxFQUFFO1lBQ2xDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7U0FDeEIsQ0FBQztRQUVGLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVqRCxPQUFPO1lBQ0wsT0FBTyxFQUFFLElBQUk7WUFDYixPQUFPLEVBQUUsUUFBUSxNQUFNLHNCQUFzQjtTQUM5QyxDQUFDO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixNQUFNLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxPQUFPO1lBQ0wsT0FBTyxFQUFFLEtBQUs7WUFDZCxPQUFPLEVBQUUsOEJBQStCLEtBQWUsQ0FBQyxPQUFPLEVBQUU7U0FDbEUsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDLENBQUM7QUFFRixrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHR5cGUgeyBCb3ggfSBmcm9tICcuLi8uLi90eXBlcyc7XG5pbXBvcnQgQm94TW9kZWwgZnJvbSAnLi4vLi4vbW9kZWxzL0JveCc7XG5pbXBvcnQgUGFsbGV0TW9kZWwgZnJvbSAnLi4vLi4vbW9kZWxzL1BhbGxldCc7XG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG5leHBvcnQgaW50ZXJmYWNlIERlbGV0ZVJlc3VsdCB7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIG1lc3NhZ2U6IHN0cmluZztcbn1cblxuLyoqXG4gKiBEZWxldGVzIGEgYm94IHJlY29yZCBmcm9tIHRoZSBkYXRhYmFzZSBhbmQgdXBkYXRlcyB0aGUgYXNzb2NpYXRlZCBwYWxsZXRcbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IGNvZGlnbyAtIFRoZSBjb2RpZ28gb2YgdGhlIGJveCB0byBkZWxldGVcbiAqIEByZXR1cm5zIHtQcm9taXNlPERlbGV0ZVJlc3VsdD59IC0gVGhlIGRlbGV0aW9uIHJlc3VsdFxuICovXG5jb25zdCBkZWxldGVCb3ggPSBhc3luYyAoY29kaWdvOiBzdHJpbmcpOiBQcm9taXNlPERlbGV0ZVJlc3VsdD4gPT4ge1xuICB0cnkge1xuICAgIC8vIDEuIEdldCB0aGUgYm94IHRvIGNoZWNrIGV4aXN0ZW5jZSBhbmQgYXNzb2NpYXRlZCBwYWxsZXRcbiAgICBjb25zdCBnZXRCb3hQYXJhbXMgPSB7XG4gICAgICBUYWJsZU5hbWU6IEJveE1vZGVsLmdldFRhYmxlTmFtZSgpLFxuICAgICAgS2V5OiB7IGNvZGlnbzogY29kaWdvIH1cbiAgICB9O1xuICAgIFxuICAgIGNvbnN0IGJveFJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLmdldChnZXRCb3hQYXJhbXMpLnByb21pc2UoKTtcbiAgICBjb25zdCBib3ggPSBib3hSZXN1bHQuSXRlbSBhcyBCb3ggfCB1bmRlZmluZWQ7XG5cbiAgICBpZiAoIWJveCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIG1lc3NhZ2U6IGBMYSBjYWphIGNvbiBjw7NkaWdvICR7Y29kaWdvfSBubyBleGlzdGVgXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIDIuIElmIHRoZSBib3ggaXMgYXNzaWduZWQgdG8gYSBwYWxsZXQsIHVwZGF0ZSB0aGUgcGFsbGV0XG4gICAgaWYgKGJveC5wYWxsZXRJZCkge1xuICAgICAgY29uc3QgZ2V0UGFsbGV0UGFyYW1zID0ge1xuICAgICAgICBUYWJsZU5hbWU6IFBhbGxldE1vZGVsLmdldFRhYmxlTmFtZSgpLFxuICAgICAgICBLZXk6IHsgY29kaWdvOiBib3gucGFsbGV0SWQgfVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgY29uc3QgcGFsbGV0UmVzdWx0ID0gYXdhaXQgZHluYW1vREIuZ2V0KGdldFBhbGxldFBhcmFtcykucHJvbWlzZSgpO1xuICAgICAgY29uc3QgcGFsbGV0ID0gcGFsbGV0UmVzdWx0Lkl0ZW07XG5cbiAgICAgIGlmIChwYWxsZXQpIHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBib3ggZnJvbSB0aGUgcGFsbGV0J3MgYm94IGxpc3RcbiAgICAgICAgY29uc3QgdXBkYXRlZEJveGVzID0gcGFsbGV0LmNhamFzLmZpbHRlcigoaXRlbTogc3RyaW5nKSA9PiBpdGVtICE9PSBjb2RpZ28pO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcGFsbGV0XG4gICAgICAgIGNvbnN0IHVwZGF0ZVBhbGxldFBhcmFtcyA9IHtcbiAgICAgICAgICBUYWJsZU5hbWU6IFBhbGxldE1vZGVsLmdldFRhYmxlTmFtZSgpLFxuICAgICAgICAgIEtleTogeyBjb2RpZ286IGJveC5wYWxsZXRJZCB9LFxuICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246ICdTRVQgY2FqYXMgPSA6Ym94ZXMsIGNhbnRpZGFkQ2FqYXMgPSA6bmV3Q291bnQnLFxuICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICc6Ym94ZXMnOiB1cGRhdGVkQm94ZXMsXG4gICAgICAgICAgICAnOm5ld0NvdW50JzogTWF0aC5tYXgoMCwgcGFsbGV0LmNhbnRpZGFkQ2FqYXMgLSAxKVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGF3YWl0IGR5bmFtb0RCLnVwZGF0ZSh1cGRhdGVQYWxsZXRQYXJhbXMpLnByb21pc2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAzLiBEZWxldGUgdGhlIGJveCBmcm9tIHRoZSBkYXRhYmFzZVxuICAgIGNvbnN0IGRlbGV0ZUJveFBhcmFtcyA9IHtcbiAgICAgIFRhYmxlTmFtZTogQm94TW9kZWwuZ2V0VGFibGVOYW1lKCksXG4gICAgICBLZXk6IHsgY29kaWdvOiBjb2RpZ28gfVxuICAgIH07XG4gICAgXG4gICAgYXdhaXQgZHluYW1vREIuZGVsZXRlKGRlbGV0ZUJveFBhcmFtcykucHJvbWlzZSgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBtZXNzYWdlOiBgQ2FqYSAke2NvZGlnb30gZWxpbWluYWRhIGNvbiDDqXhpdG9gXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBkZWxldGluZyBib3ggJHtjb2RpZ299OmAsIGVycm9yKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBtZXNzYWdlOiBgRXJyb3IgYWwgZWxpbWluYXIgbGEgY2FqYTogJHsoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2V9YFxuICAgIH07XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRlbGV0ZUJveDsiXX0=