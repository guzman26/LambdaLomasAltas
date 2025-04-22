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
exports.handler = void 0;
const AWS = __importStar(require("aws-sdk"));
// --- Configuration ---
// Use environment variables for table names
const EGGS_TABLE_NAME = process.env.EGGS_TABLE || 'Huevos';
const PALLETS_TABLE_NAME = process.env.PALLETS_TABLE || 'Pallets';
// --- AWS SDK Setup ---
const dynamoDB = new AWS.DynamoDB.DocumentClient();
/**
 * Checks if an error object is an AWS SDK error with a code.
 * Type guard function.
 */
function isAwsSdkError(error) {
    return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}
/**
 * Deletes a pallet from the database and updates all associated boxes/eggs.
 * @param {string} palletCode - Code of the pallet to delete.
 * @returns {Promise<DeleteResult>} - Result of the operation.
 */
async function deletePallet(palletCode) {
    console.log(`🗑️ Attempting to delete pallet with code: ${palletCode}`);
    try {
        // 1. Get the pallet to check existence and get associated box/egg codes
        const getPalletParams = {
            TableName: PALLETS_TABLE_NAME,
            Key: { codigo: palletCode }
        };
        console.log(`🔍 Fetching pallet: ${palletCode} from ${PALLETS_TABLE_NAME}`);
        const { Item: palletItem } = await dynamoDB.get(getPalletParams).promise();
        const pallet = palletItem; // Type assertion
        if (!pallet) {
            console.log(`⚠️ Pallet with code ${palletCode} does not exist`);
            return {
                success: false,
                message: `El pallet con código ${palletCode} no existe`
            };
        }
        // 2. If the pallet has associated items (cajas/eggs), update each to remove the pallet reference
        if (pallet.cajas && pallet.cajas.length > 0) {
            console.log(`📦 Pallet has ${pallet.cajas.length} boxes/eggs, updating them in ${EGGS_TABLE_NAME}...`);
            const updatePromises = pallet.cajas.map(boxCode => {
                const updateBoxParams = {
                    TableName: EGGS_TABLE_NAME,
                    Key: { codigo: boxCode },
                    UpdateExpression: 'REMOVE palletId',
                    // Condition ensures we only update if the box/egg actually exists.
                    // It also prevents updating if palletId was already removed by another process.
                    ConditionExpression: 'attribute_exists(codigo)', // Or 'attribute_exists(palletId)' if you only want to update those *with* a palletId
                    ReturnValues: 'NONE' // No need to return data
                };
                console.log(`📝 Attempting to remove palletId from box/egg: ${boxCode}`);
                return dynamoDB.update(updateBoxParams).promise()
                    .then(() => {
                    console.log(`✅ Successfully removed palletId from box/egg: ${boxCode}`);
                })
                    .catch((err) => {
                    // Check if it's the expected error for a non-existent item or failed condition
                    if (isAwsSdkError(err) && err.code === 'ConditionalCheckFailedException') {
                        console.log(`⚠️ Box/Egg ${boxCode} not found or condition failed (e.g., palletId already removed), skipping update.`);
                        // Resolve the promise successfully for Promise.all, as this isn't a failure in the overall process
                        return;
                    }
                    // Log and re-throw unexpected errors to fail the Promise.all
                    console.error(`❌ Error updating box/egg ${boxCode}:`, err);
                    throw err;
                });
            });
            // Wait for all box/egg updates (or skips) to complete
            await Promise.all(updatePromises);
            console.log(`✅ Finished processing all boxes/eggs for pallet ${palletCode}.`);
        }
        else {
            console.log(`ℹ️ Pallet ${palletCode} has no associated boxes/eggs listed.`);
        }
        // 3. Delete the pallet itself
        const deletePalletParams = {
            TableName: PALLETS_TABLE_NAME,
            Key: { codigo: palletCode }
            // Optional: Add ConditionExpression: 'attribute_exists(codigo)' if needed
        };
        console.log(`🗑️ Deleting pallet ${palletCode} from ${PALLETS_TABLE_NAME}`);
        await dynamoDB.delete(deletePalletParams).promise();
        console.log(`✅ Pallet ${palletCode} deleted successfully`);
        return {
            success: true,
            message: `Pallet ${palletCode} eliminado con éxito`
        };
    }
    catch (error) {
        let errorMessage = 'An unknown error occurred during pallet deletion';
        if (isAwsSdkError(error)) {
            // Log AWS specific error codes if available
            errorMessage = `AWS Error Code: ${error.code} - ${error.message}`;
        }
        else if (error instanceof Error) {
            errorMessage = error.message;
        }
        else if (typeof error === 'string') {
            errorMessage = error;
        }
        console.error(`❌ Error deleting pallet ${palletCode}: ${errorMessage}`, error);
        return {
            success: false,
            message: `Error al eliminar el pallet: ${errorMessage}`
        };
    }
}
// --- Lambda Handler ---
const handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
    let requestBody = null;
    let codigo;
    try {
        // Parse the request body safely
        if (event.body) {
            requestBody = JSON.parse(event.body);
            codigo = requestBody === null || requestBody === void 0 ? void 0 : requestBody.codigo;
        }
        else {
            console.log("⚠️ Event body is missing or empty.");
            // Add checks for path parameters or query strings if applicable
            // codigo = event.pathParameters?.codigo || event.queryStringParameters?.codigo;
        }
        if (!codigo) {
            console.log("🛑 Missing pallet code ('codigo') in request.");
            return {
                statusCode: 400,
                // headers: { 'Access-Control-Allow-Origin': '*' }, // Add CORS if needed
                body: JSON.stringify({
                    success: false,
                    message: 'Falta el código del pallet'
                })
            };
        }
        // Delete the pallet using the core logic
        const result = await deletePallet(codigo);
        // Return the result
        return {
            statusCode: result.success ? 200 : 400, // Consider 500 if result.success is false due to an unexpected error within deletePallet
            // headers: { 'Access-Control-Allow-Origin': '*' }, // Add CORS if needed
            body: JSON.stringify(result)
        };
    }
    catch (error) {
        let errorMessage = 'An unknown error occurred in the Lambda handler';
        let statusCode = 500;
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            errorMessage = "Invalid JSON format in request body";
            statusCode = 400;
            console.error(`❌ Error parsing request body: ${error.message}`);
        }
        else if (isAwsSdkError(error)) {
            errorMessage = `AWS Error: ${error.code} - ${error.message}`;
            console.error(`❌ AWS Error in Lambda handler: ${errorMessage}`, error);
        }
        else if (error instanceof Error) {
            errorMessage = error.message;
            console.error(`❌ Error in Lambda handler: ${errorMessage}`, error);
        }
        else if (typeof error === 'string') {
            errorMessage = error;
            console.error(`❌ Error in Lambda handler: ${errorMessage}`, error);
        }
        else {
            console.error(`❌ Unknown error in Lambda handler:`, error);
        }
        return {
            statusCode: statusCode,
            // headers: { 'Access-Control-Allow-Origin': '*' }, // Add CORS if needed
            body: JSON.stringify({
                success: false,
                message: `Error interno del servidor: ${errorMessage}`
            })
        };
    }
};
exports.handler = handler;
// --- Export for Testing (Optional) ---
exports.default = {
    deletePallet
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vY29udHJvbGxlcnMvcGFsbGV0cy9kZWxldGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBSS9CLHdCQUF3QjtBQUN4Qiw0Q0FBNEM7QUFDNUMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDO0FBQzNELE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUyxDQUFDO0FBd0JsRSx3QkFBd0I7QUFDeEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRW5EOzs7R0FHRztBQUNILFNBQVMsYUFBYSxDQUFDLEtBQWM7SUFDakMsT0FBTyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxNQUFNLElBQUksS0FBSyxJQUFJLFNBQVMsSUFBSSxLQUFLLENBQUM7QUFDaEcsQ0FBQztBQUdEOzs7O0dBSUc7QUFDSCxLQUFLLFVBQVUsWUFBWSxDQUFDLFVBQWtCO0lBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsOENBQThDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFFeEUsSUFBSSxDQUFDO1FBQ0gsd0VBQXdFO1FBQ3hFLE1BQU0sZUFBZSxHQUFnQztZQUNuRCxTQUFTLEVBQUUsa0JBQWtCO1lBQzdCLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUU7U0FDNUIsQ0FBQztRQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLFVBQVUsU0FBUyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7UUFDNUUsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0UsTUFBTSxNQUFNLEdBQUcsVUFBZ0MsQ0FBQyxDQUFDLGlCQUFpQjtRQUVsRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixVQUFVLGlCQUFpQixDQUFDLENBQUM7WUFDaEUsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPLEVBQUUsd0JBQXdCLFVBQVUsWUFBWTthQUN4RCxDQUFDO1FBQ0osQ0FBQztRQUVELGlHQUFpRztRQUNqRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLGlDQUFpQyxlQUFlLEtBQUssQ0FBQyxDQUFDO1lBRXZHLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNoRCxNQUFNLGVBQWUsR0FBbUM7b0JBQ3RELFNBQVMsRUFBRSxlQUFlO29CQUMxQixHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO29CQUN4QixnQkFBZ0IsRUFBRSxpQkFBaUI7b0JBQ25DLG1FQUFtRTtvQkFDbkUsZ0ZBQWdGO29CQUNoRixtQkFBbUIsRUFBRSwwQkFBMEIsRUFBRSxxRkFBcUY7b0JBQ3RJLFlBQVksRUFBRSxNQUFNLENBQUMseUJBQXlCO2lCQUMvQyxDQUFDO2dCQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0RBQWtELE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ3pFLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLEVBQUU7cUJBQzlDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpREFBaUQsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDNUUsQ0FBQyxDQUFDO3FCQUNELEtBQUssQ0FBQyxDQUFDLEdBQVksRUFBRSxFQUFFO29CQUN0QiwrRUFBK0U7b0JBQy9FLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssaUNBQWlDLEVBQUUsQ0FBQzt3QkFDekUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLE9BQU8sbUZBQW1GLENBQUMsQ0FBQzt3QkFDdEgsbUdBQW1HO3dCQUNuRyxPQUFPO29CQUNULENBQUM7b0JBQ0QsNkRBQTZEO29CQUM3RCxPQUFPLENBQUMsS0FBSyxDQUFDLDRCQUE0QixPQUFPLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDM0QsTUFBTSxHQUFHLENBQUM7Z0JBQ1osQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILHNEQUFzRDtZQUN0RCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNoRixDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxVQUFVLHVDQUF1QyxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUVELDhCQUE4QjtRQUM5QixNQUFNLGtCQUFrQixHQUFtQztZQUN6RCxTQUFTLEVBQUUsa0JBQWtCO1lBQzdCLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUU7WUFDM0IsMEVBQTBFO1NBQzNFLENBQUM7UUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixVQUFVLFNBQVMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxVQUFVLHVCQUF1QixDQUFDLENBQUM7UUFFM0QsT0FBTztZQUNMLE9BQU8sRUFBRSxJQUFJO1lBQ2IsT0FBTyxFQUFFLFVBQVUsVUFBVSxzQkFBc0I7U0FDcEQsQ0FBQztJQUVKLENBQUM7SUFBQyxPQUFPLEtBQWMsRUFBRSxDQUFDO1FBQ3ZCLElBQUksWUFBWSxHQUFHLGtEQUFrRCxDQUFDO1FBQ3RFLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkIsNENBQTRDO1lBQzVDLFlBQVksR0FBRyxtQkFBbUIsS0FBSyxDQUFDLElBQUksTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEUsQ0FBQzthQUFNLElBQUksS0FBSyxZQUFZLEtBQUssRUFBRSxDQUFDO1lBQ2hDLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pDLENBQUM7YUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ25DLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDekIsQ0FBQztRQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLFVBQVUsS0FBSyxZQUFZLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvRSxPQUFPO1lBQ0wsT0FBTyxFQUFFLEtBQUs7WUFDZCxPQUFPLEVBQUUsZ0NBQWdDLFlBQVksRUFBRTtTQUN4RCxDQUFDO0lBQ0wsQ0FBQztBQUNILENBQUM7QUFFRCx5QkFBeUI7QUFDbEIsTUFBTSxPQUFPLEdBQXlELEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUN6RixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRS9ELElBQUksV0FBVyxHQUF1QixJQUFJLENBQUM7SUFDM0MsSUFBSSxNQUEwQixDQUFDO0lBRWpDLElBQUksQ0FBQztRQUNELGdDQUFnQztRQUNoQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNiLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQWdCLENBQUM7WUFDcEQsTUFBTSxHQUFHLFdBQVcsYUFBWCxXQUFXLHVCQUFYLFdBQVcsQ0FBRSxNQUFNLENBQUM7UUFDakMsQ0FBQzthQUFNLENBQUM7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7WUFDbEQsZ0VBQWdFO1lBQ2hFLGdGQUFnRjtRQUNyRixDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1lBQzdELE9BQU87Z0JBQ0wsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YseUVBQXlFO2dCQUN6RSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDbkIsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsT0FBTyxFQUFFLDRCQUE0QjtpQkFDdEMsQ0FBQzthQUNILENBQUM7UUFDSixDQUFDO1FBRUQseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTFDLG9CQUFvQjtRQUNwQixPQUFPO1lBQ0wsVUFBVSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLHlGQUF5RjtZQUNqSSx5RUFBeUU7WUFDekUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1NBQzdCLENBQUM7SUFFTixDQUFDO0lBQUMsT0FBTyxLQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLFlBQVksR0FBRyxpREFBaUQsQ0FBQztRQUNyRSxJQUFJLFVBQVUsR0FBRyxHQUFHLENBQUM7UUFFckIsSUFBSSxLQUFLLFlBQVksV0FBVyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDakUsWUFBWSxHQUFHLHFDQUFxQyxDQUFDO1lBQ3JELFVBQVUsR0FBRyxHQUFHLENBQUM7WUFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDcEUsQ0FBQzthQUFNLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDOUIsWUFBWSxHQUFHLGNBQWMsS0FBSyxDQUFDLElBQUksTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0UsQ0FBQzthQUFNLElBQUksS0FBSyxZQUFZLEtBQUssRUFBRSxDQUFDO1lBQ2pDLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEJBQThCLFlBQVksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7YUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ25DLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDckIsT0FBTyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkUsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFQSxPQUFPO1lBQ0wsVUFBVSxFQUFFLFVBQVU7WUFDdEIseUVBQXlFO1lBQ3pFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPLEVBQUUsK0JBQStCLFlBQVksRUFBRTthQUN2RCxDQUFDO1NBQ0gsQ0FBQztJQUNOLENBQUM7QUFDSCxDQUFDLENBQUM7QUFyRVcsUUFBQSxPQUFPLFdBcUVsQjtBQUVGLHdDQUF3QztBQUN4QyxrQkFBZTtJQUNiLFlBQVk7Q0FDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHsgRG9jdW1lbnRDbGllbnQgfSBmcm9tICdhd3Mtc2RrL2NsaWVudHMvZHluYW1vZGInO1xuaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCwgSGFuZGxlciB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuXG4vLyAtLS0gQ29uZmlndXJhdGlvbiAtLS1cbi8vIFVzZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZm9yIHRhYmxlIG5hbWVzXG5jb25zdCBFR0dTX1RBQkxFX05BTUUgPSBwcm9jZXNzLmVudi5FR0dTX1RBQkxFIHx8ICdIdWV2b3MnO1xuY29uc3QgUEFMTEVUU19UQUJMRV9OQU1FID0gcHJvY2Vzcy5lbnYuUEFMTEVUU19UQUJMRSB8fCAnUGFsbGV0cyc7XG5cbi8vIC0tLSBJbnRlcmZhY2VzIC0tLVxuaW50ZXJmYWNlIFBhbGxldCB7XG4gIGNvZGlnbzogc3RyaW5nO1xuICBjYWphcz86IHN0cmluZ1tdOyAvLyBBcnJheSBvZiBlZ2cvYm94IGNvZGVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgcGFsbGV0XG4gIC8vIEFkZCBvdGhlciBwYWxsZXQgcHJvcGVydGllcyBoZXJlIGlmIHRoZXkgZXhpc3Rcbn1cblxuaW50ZXJmYWNlIEVnZyB7XG4gIGNvZGlnbzogc3RyaW5nO1xuICBwYWxsZXRJZD86IHN0cmluZzsgLy8gVGhpcyBmaWVsZCB3aWxsIGJlIHJlbW92ZWRcbiAgLy8gQWRkIG90aGVyIGVnZy9ib3ggcHJvcGVydGllcyBoZXJlIGlmIHRoZXkgZXhpc3Rcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWxldGVSZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuO1xuICBtZXNzYWdlOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBSZXF1ZXN0Qm9keSB7XG4gICAgY29kaWdvPzogc3RyaW5nO1xufVxuXG4vLyAtLS0gQVdTIFNESyBTZXR1cCAtLS1cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhbiBlcnJvciBvYmplY3QgaXMgYW4gQVdTIFNESyBlcnJvciB3aXRoIGEgY29kZS5cbiAqIFR5cGUgZ3VhcmQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGlzQXdzU2RrRXJyb3IoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyB7IGNvZGU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nOyBba2V5OiBzdHJpbmddOiBhbnkgfSB7XG4gICAgcmV0dXJuIHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IgIT09IG51bGwgJiYgJ2NvZGUnIGluIGVycm9yICYmICdtZXNzYWdlJyBpbiBlcnJvcjtcbn1cblxuXG4vKipcbiAqIERlbGV0ZXMgYSBwYWxsZXQgZnJvbSB0aGUgZGF0YWJhc2UgYW5kIHVwZGF0ZXMgYWxsIGFzc29jaWF0ZWQgYm94ZXMvZWdncy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwYWxsZXRDb2RlIC0gQ29kZSBvZiB0aGUgcGFsbGV0IHRvIGRlbGV0ZS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPERlbGV0ZVJlc3VsdD59IC0gUmVzdWx0IG9mIHRoZSBvcGVyYXRpb24uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVBhbGxldChwYWxsZXRDb2RlOiBzdHJpbmcpOiBQcm9taXNlPERlbGV0ZVJlc3VsdD4ge1xuICBjb25zb2xlLmxvZyhg8J+Xke+4jyBBdHRlbXB0aW5nIHRvIGRlbGV0ZSBwYWxsZXQgd2l0aCBjb2RlOiAke3BhbGxldENvZGV9YCk7XG5cbiAgdHJ5IHtcbiAgICAvLyAxLiBHZXQgdGhlIHBhbGxldCB0byBjaGVjayBleGlzdGVuY2UgYW5kIGdldCBhc3NvY2lhdGVkIGJveC9lZ2cgY29kZXNcbiAgICBjb25zdCBnZXRQYWxsZXRQYXJhbXM6IERvY3VtZW50Q2xpZW50LkdldEl0ZW1JbnB1dCA9IHtcbiAgICAgIFRhYmxlTmFtZTogUEFMTEVUU19UQUJMRV9OQU1FLFxuICAgICAgS2V5OiB7IGNvZGlnbzogcGFsbGV0Q29kZSB9XG4gICAgfTtcbiAgICBjb25zb2xlLmxvZyhg8J+UjSBGZXRjaGluZyBwYWxsZXQ6ICR7cGFsbGV0Q29kZX0gZnJvbSAke1BBTExFVFNfVEFCTEVfTkFNRX1gKTtcbiAgICBjb25zdCB7IEl0ZW06IHBhbGxldEl0ZW0gfSA9IGF3YWl0IGR5bmFtb0RCLmdldChnZXRQYWxsZXRQYXJhbXMpLnByb21pc2UoKTtcbiAgICBjb25zdCBwYWxsZXQgPSBwYWxsZXRJdGVtIGFzIFBhbGxldCB8IHVuZGVmaW5lZDsgLy8gVHlwZSBhc3NlcnRpb25cblxuICAgIGlmICghcGFsbGV0KSB7XG4gICAgICBjb25zb2xlLmxvZyhg4pqg77iPIFBhbGxldCB3aXRoIGNvZGUgJHtwYWxsZXRDb2RlfSBkb2VzIG5vdCBleGlzdGApO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIG1lc3NhZ2U6IGBFbCBwYWxsZXQgY29uIGPDs2RpZ28gJHtwYWxsZXRDb2RlfSBubyBleGlzdGVgXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIDIuIElmIHRoZSBwYWxsZXQgaGFzIGFzc29jaWF0ZWQgaXRlbXMgKGNhamFzL2VnZ3MpLCB1cGRhdGUgZWFjaCB0byByZW1vdmUgdGhlIHBhbGxldCByZWZlcmVuY2VcbiAgICBpZiAocGFsbGV0LmNhamFzICYmIHBhbGxldC5jYWphcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zb2xlLmxvZyhg8J+TpiBQYWxsZXQgaGFzICR7cGFsbGV0LmNhamFzLmxlbmd0aH0gYm94ZXMvZWdncywgdXBkYXRpbmcgdGhlbSBpbiAke0VHR1NfVEFCTEVfTkFNRX0uLi5gKTtcblxuICAgICAgY29uc3QgdXBkYXRlUHJvbWlzZXMgPSBwYWxsZXQuY2FqYXMubWFwKGJveENvZGUgPT4ge1xuICAgICAgICBjb25zdCB1cGRhdGVCb3hQYXJhbXM6IERvY3VtZW50Q2xpZW50LlVwZGF0ZUl0ZW1JbnB1dCA9IHtcbiAgICAgICAgICBUYWJsZU5hbWU6IEVHR1NfVEFCTEVfTkFNRSxcbiAgICAgICAgICBLZXk6IHsgY29kaWdvOiBib3hDb2RlIH0sXG4gICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogJ1JFTU9WRSBwYWxsZXRJZCcsXG4gICAgICAgICAgLy8gQ29uZGl0aW9uIGVuc3VyZXMgd2Ugb25seSB1cGRhdGUgaWYgdGhlIGJveC9lZ2cgYWN0dWFsbHkgZXhpc3RzLlxuICAgICAgICAgIC8vIEl0IGFsc28gcHJldmVudHMgdXBkYXRpbmcgaWYgcGFsbGV0SWQgd2FzIGFscmVhZHkgcmVtb3ZlZCBieSBhbm90aGVyIHByb2Nlc3MuXG4gICAgICAgICAgQ29uZGl0aW9uRXhwcmVzc2lvbjogJ2F0dHJpYnV0ZV9leGlzdHMoY29kaWdvKScsIC8vIE9yICdhdHRyaWJ1dGVfZXhpc3RzKHBhbGxldElkKScgaWYgeW91IG9ubHkgd2FudCB0byB1cGRhdGUgdGhvc2UgKndpdGgqIGEgcGFsbGV0SWRcbiAgICAgICAgICBSZXR1cm5WYWx1ZXM6ICdOT05FJyAvLyBObyBuZWVkIHRvIHJldHVybiBkYXRhXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS5sb2coYPCfk50gQXR0ZW1wdGluZyB0byByZW1vdmUgcGFsbGV0SWQgZnJvbSBib3gvZWdnOiAke2JveENvZGV9YCk7XG4gICAgICAgIHJldHVybiBkeW5hbW9EQi51cGRhdGUodXBkYXRlQm94UGFyYW1zKS5wcm9taXNlKClcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUgU3VjY2Vzc2Z1bGx5IHJlbW92ZWQgcGFsbGV0SWQgZnJvbSBib3gvZWdnOiAke2JveENvZGV9YCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKGVycjogdW5rbm93bikgPT4ge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyB0aGUgZXhwZWN0ZWQgZXJyb3IgZm9yIGEgbm9uLWV4aXN0ZW50IGl0ZW0gb3IgZmFpbGVkIGNvbmRpdGlvblxuICAgICAgICAgICAgaWYgKGlzQXdzU2RrRXJyb3IoZXJyKSAmJiBlcnIuY29kZSA9PT0gJ0NvbmRpdGlvbmFsQ2hlY2tGYWlsZWRFeGNlcHRpb24nKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDimqDvuI8gQm94L0VnZyAke2JveENvZGV9IG5vdCBmb3VuZCBvciBjb25kaXRpb24gZmFpbGVkIChlLmcuLCBwYWxsZXRJZCBhbHJlYWR5IHJlbW92ZWQpLCBza2lwcGluZyB1cGRhdGUuYCk7XG4gICAgICAgICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2Ugc3VjY2Vzc2Z1bGx5IGZvciBQcm9taXNlLmFsbCwgYXMgdGhpcyBpc24ndCBhIGZhaWx1cmUgaW4gdGhlIG92ZXJhbGwgcHJvY2Vzc1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBMb2cgYW5kIHJlLXRocm93IHVuZXhwZWN0ZWQgZXJyb3JzIHRvIGZhaWwgdGhlIFByb21pc2UuYWxsXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgdXBkYXRpbmcgYm94L2VnZyAke2JveENvZGV9OmAsIGVycik7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgLy8gV2FpdCBmb3IgYWxsIGJveC9lZ2cgdXBkYXRlcyAob3Igc2tpcHMpIHRvIGNvbXBsZXRlXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbCh1cGRhdGVQcm9taXNlcyk7XG4gICAgICBjb25zb2xlLmxvZyhg4pyFIEZpbmlzaGVkIHByb2Nlc3NpbmcgYWxsIGJveGVzL2VnZ3MgZm9yIHBhbGxldCAke3BhbGxldENvZGV9LmApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDihLnvuI8gUGFsbGV0ICR7cGFsbGV0Q29kZX0gaGFzIG5vIGFzc29jaWF0ZWQgYm94ZXMvZWdncyBsaXN0ZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gMy4gRGVsZXRlIHRoZSBwYWxsZXQgaXRzZWxmXG4gICAgY29uc3QgZGVsZXRlUGFsbGV0UGFyYW1zOiBEb2N1bWVudENsaWVudC5EZWxldGVJdGVtSW5wdXQgPSB7XG4gICAgICBUYWJsZU5hbWU6IFBBTExFVFNfVEFCTEVfTkFNRSxcbiAgICAgIEtleTogeyBjb2RpZ286IHBhbGxldENvZGUgfVxuICAgICAgLy8gT3B0aW9uYWw6IEFkZCBDb25kaXRpb25FeHByZXNzaW9uOiAnYXR0cmlidXRlX2V4aXN0cyhjb2RpZ28pJyBpZiBuZWVkZWRcbiAgICB9O1xuICAgIGNvbnNvbGUubG9nKGDwn5eR77iPIERlbGV0aW5nIHBhbGxldCAke3BhbGxldENvZGV9IGZyb20gJHtQQUxMRVRTX1RBQkxFX05BTUV9YCk7XG4gICAgYXdhaXQgZHluYW1vREIuZGVsZXRlKGRlbGV0ZVBhbGxldFBhcmFtcykucHJvbWlzZSgpO1xuICAgIGNvbnNvbGUubG9nKGDinIUgUGFsbGV0ICR7cGFsbGV0Q29kZX0gZGVsZXRlZCBzdWNjZXNzZnVsbHlgKTtcblxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgbWVzc2FnZTogYFBhbGxldCAke3BhbGxldENvZGV9IGVsaW1pbmFkbyBjb24gw6l4aXRvYFxuICAgIH07XG5cbiAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgbGV0IGVycm9yTWVzc2FnZSA9ICdBbiB1bmtub3duIGVycm9yIG9jY3VycmVkIGR1cmluZyBwYWxsZXQgZGVsZXRpb24nO1xuICAgICBpZiAoaXNBd3NTZGtFcnJvcihlcnJvcikpIHtcbiAgICAgICAgIC8vIExvZyBBV1Mgc3BlY2lmaWMgZXJyb3IgY29kZXMgaWYgYXZhaWxhYmxlXG4gICAgICAgICBlcnJvck1lc3NhZ2UgPSBgQVdTIEVycm9yIENvZGU6ICR7ZXJyb3IuY29kZX0gLSAke2Vycm9yLm1lc3NhZ2V9YDtcbiAgICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICBlcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICB9IGVsc2UgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgIGVycm9yTWVzc2FnZSA9IGVycm9yO1xuICAgICB9XG4gICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBFcnJvciBkZWxldGluZyBwYWxsZXQgJHtwYWxsZXRDb2RlfTogJHtlcnJvck1lc3NhZ2V9YCwgZXJyb3IpO1xuICAgICByZXR1cm4ge1xuICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgIG1lc3NhZ2U6IGBFcnJvciBhbCBlbGltaW5hciBlbCBwYWxsZXQ6ICR7ZXJyb3JNZXNzYWdlfWBcbiAgICAgfTtcbiAgfVxufVxuXG4vLyAtLS0gTGFtYmRhIEhhbmRsZXIgLS0tXG5leHBvcnQgY29uc3QgaGFuZGxlcjogSGFuZGxlcjxBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiUmVjZWl2ZWQgZXZlbnQ6XCIsIEpTT04uc3RyaW5naWZ5KGV2ZW50LCBudWxsLCAyKSk7XG5cbiAgICBsZXQgcmVxdWVzdEJvZHk6IFJlcXVlc3RCb2R5IHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGNvZGlnbzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgICAvLyBQYXJzZSB0aGUgcmVxdWVzdCBib2R5IHNhZmVseVxuICAgICAgaWYgKGV2ZW50LmJvZHkpIHtcbiAgICAgICAgICByZXF1ZXN0Qm9keSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSkgYXMgUmVxdWVzdEJvZHk7XG4gICAgICAgICAgY29kaWdvID0gcmVxdWVzdEJvZHk/LmNvZGlnbztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIGNvbnNvbGUubG9nKFwi4pqg77iPIEV2ZW50IGJvZHkgaXMgbWlzc2luZyBvciBlbXB0eS5cIik7XG4gICAgICAgICAgIC8vIEFkZCBjaGVja3MgZm9yIHBhdGggcGFyYW1ldGVycyBvciBxdWVyeSBzdHJpbmdzIGlmIGFwcGxpY2FibGVcbiAgICAgICAgICAgLy8gY29kaWdvID0gZXZlbnQucGF0aFBhcmFtZXRlcnM/LmNvZGlnbyB8fCBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnM/LmNvZGlnbztcbiAgICAgIH1cblxuICAgICAgaWYgKCFjb2RpZ28pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCLwn5uRIE1pc3NpbmcgcGFsbGV0IGNvZGUgKCdjb2RpZ28nKSBpbiByZXF1ZXN0LlwiKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICAgICAgLy8gaGVhZGVyczogeyAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonIH0sIC8vIEFkZCBDT1JTIGlmIG5lZWRlZFxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0ZhbHRhIGVsIGPDs2RpZ28gZGVsIHBhbGxldCdcbiAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBEZWxldGUgdGhlIHBhbGxldCB1c2luZyB0aGUgY29yZSBsb2dpY1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGVsZXRlUGFsbGV0KGNvZGlnbyk7XG5cbiAgICAgIC8vIFJldHVybiB0aGUgcmVzdWx0XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXNDb2RlOiByZXN1bHQuc3VjY2VzcyA/IDIwMCA6IDQwMCwgLy8gQ29uc2lkZXIgNTAwIGlmIHJlc3VsdC5zdWNjZXNzIGlzIGZhbHNlIGR1ZSB0byBhbiB1bmV4cGVjdGVkIGVycm9yIHdpdGhpbiBkZWxldGVQYWxsZXRcbiAgICAgICAgLy8gaGVhZGVyczogeyAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonIH0sIC8vIEFkZCBDT1JTIGlmIG5lZWRlZFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXN1bHQpXG4gICAgICB9O1xuXG4gIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgICBsZXQgZXJyb3JNZXNzYWdlID0gJ0FuIHVua25vd24gZXJyb3Igb2NjdXJyZWQgaW4gdGhlIExhbWJkYSBoYW5kbGVyJztcbiAgICAgIGxldCBzdGF0dXNDb2RlID0gNTAwO1xuXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBTeW50YXhFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdKU09OJykpIHtcbiAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBcIkludmFsaWQgSlNPTiBmb3JtYXQgaW4gcmVxdWVzdCBib2R5XCI7XG4gICAgICAgICAgc3RhdHVzQ29kZSA9IDQwMDtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgcGFyc2luZyByZXF1ZXN0IGJvZHk6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNBd3NTZGtFcnJvcihlcnJvcikpIHtcbiAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgQVdTIEVycm9yOiAke2Vycm9yLmNvZGV9IC0gJHtlcnJvci5tZXNzYWdlfWA7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIEFXUyBFcnJvciBpbiBMYW1iZGEgaGFuZGxlcjogJHtlcnJvck1lc3NhZ2V9YCwgZXJyb3IpO1xuICAgICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICBlcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgY29uc29sZS5lcnJvcihg4p2MIEVycm9yIGluIExhbWJkYSBoYW5kbGVyOiAke2Vycm9yTWVzc2FnZX1gLCBlcnJvcik7XG4gICAgIH0gZWxzZSBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykge1xuICAgICAgICAgZXJyb3JNZXNzYWdlID0gZXJyb3I7XG4gICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgaW4gTGFtYmRhIGhhbmRsZXI6ICR7ZXJyb3JNZXNzYWdlfWAsIGVycm9yKTtcbiAgICAgfSBlbHNlIHtcbiAgICAgICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBVbmtub3duIGVycm9yIGluIExhbWJkYSBoYW5kbGVyOmAsIGVycm9yKTtcbiAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXNDb2RlOiBzdGF0dXNDb2RlLFxuICAgICAgICAvLyBoZWFkZXJzOiB7ICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicgfSwgLy8gQWRkIENPUlMgaWYgbmVlZGVkXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICBtZXNzYWdlOiBgRXJyb3IgaW50ZXJubyBkZWwgc2Vydmlkb3I6ICR7ZXJyb3JNZXNzYWdlfWBcbiAgICAgICAgfSlcbiAgICAgIH07XG4gIH1cbn07XG5cbi8vIC0tLSBFeHBvcnQgZm9yIFRlc3RpbmcgKE9wdGlvbmFsKSAtLS1cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZGVsZXRlUGFsbGV0XG59OyAgIl19