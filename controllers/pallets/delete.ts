import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';

// --- Configuration ---
// Use environment variables for table names
const EGGS_TABLE_NAME = process.env.EGGS_TABLE || 'Huevos';
const PALLETS_TABLE_NAME = process.env.PALLETS_TABLE || 'Pallets';

// --- Interfaces ---
interface Pallet {
  codigo: string;
  cajas?: string[]; // Array of egg/box codes associated with the pallet
  // Add other pallet properties here if they exist
}

interface Egg {
  codigo: string;
  palletId?: string; // This field will be removed
  // Add other egg/box properties here if they exist
}

interface DeleteResult {
  success: boolean;
  message: string;
}

interface RequestBody {
    codigo?: string;
}

// --- AWS SDK Setup ---
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Checks if an error object is an AWS SDK error with a code.
 * Type guard function.
 */
function isAwsSdkError(error: unknown): error is { code: string; message: string; [key: string]: any } {
    return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}


/**
 * Deletes a pallet from the database and updates all associated boxes/eggs.
 * @param {string} palletCode - Code of the pallet to delete.
 * @returns {Promise<DeleteResult>} - Result of the operation.
 */
async function deletePallet(palletCode: string): Promise<DeleteResult> {
  console.log(`🗑️ Attempting to delete pallet with code: ${palletCode}`);

  try {
    // 1. Get the pallet to check existence and get associated box/egg codes
    const getPalletParams: DocumentClient.GetItemInput = {
      TableName: PALLETS_TABLE_NAME,
      Key: { codigo: palletCode }
    };
    console.log(`🔍 Fetching pallet: ${palletCode} from ${PALLETS_TABLE_NAME}`);
    const { Item: palletItem } = await dynamoDB.get(getPalletParams).promise();
    const pallet = palletItem as Pallet | undefined; // Type assertion

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
        const updateBoxParams: DocumentClient.UpdateItemInput = {
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
          .catch((err: unknown) => {
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
    } else {
        console.log(`ℹ️ Pallet ${palletCode} has no associated boxes/eggs listed.`);
    }

    // 3. Delete the pallet itself
    const deletePalletParams: DocumentClient.DeleteItemInput = {
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

  } catch (error: unknown) {
     let errorMessage = 'An unknown error occurred during pallet deletion';
     if (isAwsSdkError(error)) {
         // Log AWS specific error codes if available
         errorMessage = `AWS Error Code: ${error.code} - ${error.message}`;
     } else if (error instanceof Error) {
         errorMessage = error.message;
     } else if (typeof error === 'string') {
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
export const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    let requestBody: RequestBody | null = null;
    let codigo: string | undefined;

  try {
      // Parse the request body safely
      if (event.body) {
          requestBody = JSON.parse(event.body) as RequestBody;
          codigo = requestBody?.codigo;
      } else {
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

  } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred in the Lambda handler';
      let statusCode = 500;

      if (error instanceof SyntaxError && error.message.includes('JSON')) {
          errorMessage = "Invalid JSON format in request body";
          statusCode = 400;
          console.error(`❌ Error parsing request body: ${error.message}`);
      } else if (isAwsSdkError(error)) {
          errorMessage = `AWS Error: ${error.code} - ${error.message}`;
          console.error(`❌ AWS Error in Lambda handler: ${errorMessage}`, error);
      } else if (error instanceof Error) {
         errorMessage = error.message;
         console.error(`❌ Error in Lambda handler: ${errorMessage}`, error);
     } else if (typeof error === 'string') {
         errorMessage = error;
         console.error(`❌ Error in Lambda handler: ${errorMessage}`, error);
     } else {
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

// --- Export for Testing (Optional) ---
export { deletePallet };