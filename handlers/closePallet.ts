import * as AWS from "aws-sdk";
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE: string = "Pallets";

/**
 * Interface for the Pallet data structure in DynamoDB relevant to this function.
 */
interface Pallet {
  codigo: string; // Partition Key
  estado: 'open' | 'closed' | string; // Assuming estado can be other strings too
  cajas?: string[]; // Optional array of box codes
  // Add other pallet properties if known
}


/**
 * Toggles the status of a pallet between 'open' and 'closed'.
 * @param {string} codigo - The code of the pallet to update
 * @returns {Promise<Pallet>} - The updated pallet info
 * @throws {Error} - If the pallet doesn't exist or fails validation
 */
export async function togglePalletStatus(codigo: string): Promise<Pallet> {
  console.log(`📦 Attempting to toggle status of pallet "${codigo}"...`);

  if (!codigo || typeof codigo !== "string") {
    throw new Error("Invalid or missing pallet code.");
  }

  try {
    // 1. Get the current pallet
    const getParams: DocumentClient.GetItemInput = {
      TableName: PALLETS_TABLE,
      Key: { codigo },
    };

    const getResult = await dynamoDB.get(getParams).promise();
    const pallet: Pallet | undefined = getResult.Item as Pallet | undefined; // Type assertion

    if (!pallet) {
      throw new Error(`Pallet "${codigo}" not found.`);
    }

    // Use nullish coalescing to default to 'open' if estado is missing
    const currentStatus = pallet.estado ?? 'open';
    const isClosed = currentStatus === 'closed';

    // 2. If closing, validate it has boxes
    // Check if currentStatus is NOT 'closed' (meaning it's 'open' or something else we want to close)
    // And check if cajas is not an array or is an empty array.
    if (!isClosed && (!Array.isArray(pallet.cajas) || pallet.cajas.length === 0)) {
      throw new Error(`Pallet "${codigo}" has no boxes and cannot be closed.`);
    }

    // 3. Determine the new state
    const newStatus = isClosed ? "open" : "closed";

    // 4. Update the pallet's status
    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: PALLETS_TABLE,
      Key: { codigo },
      UpdateExpression: "SET estado = :estado",
      ExpressionAttributeValues: {
        ":estado": newStatus,
      },
      ReturnValues: "ALL_NEW", // Request the item's attributes after the update
    };

    const updateResult = await dynamoDB.update(updateParams).promise();
    // Type assert the Attributes property to Pallet
    const updatedPallet: Pallet | undefined = updateResult.Attributes as Pallet | undefined;

    // Ensure updatedPallet is available after the update with ReturnValues: 'ALL_NEW'
    if (!updatedPallet) {
         // This case should ideally not happen with ALL_NEW, but good for robustness
         throw new Error(`Failed to retrieve updated pallet data for "${codigo}".`);
    }


    console.log(`✅ Pallet "${codigo}" updated: ${currentStatus} ➡️ ${newStatus}`);

    return updatedPallet; // Return the updated pallet object
  } catch (error: any) { // Use 'any' for broader compatibility with error types
    console.error(`❌ Error toggling status of pallet "${codigo}":`, error);
    // Re-throw a new error with a more general message for the API layer/caller
    throw new Error(`Failed to toggle pallet status: ${error.message}`);
  }
}

// Export the function for external use
export default togglePalletStatus;