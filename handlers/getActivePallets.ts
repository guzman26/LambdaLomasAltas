import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
// Assuming createApiResponse exists and potentially exports its return type
import createApiResponse from "../utils/response";
import { ApiResponse } from "../types";

// --- Configuration ---
const PALLETS_TABLE_NAME = process.env.PALLETS_TABLE || "Pallets";

// --- Interfaces ---

// Define the structure of a Pallet item based on usage and assumptions
interface Pallet {
  codigo: string; // Assuming 'codigo' is the primary key based on other examples
  estado: string; // The status field used in the filter
  // Add other potential properties of a Pallet
  cajas?: string[];
  cantidadCajas?: number;
  // ... other fields
}

/*
 * Placeholder type definition for the imported utility's response.
 * Adjust this interface based on the actual structure returned by createApiResponse.
 * Example assumes a structure suitable for API Gateway Lambda Proxy integration.
 */
/* // --> If ApiResponse is NOT exported from ../utils/response, define it here:
interface ApiResponse {
  statusCode: number;
  body: string; // Usually a JSON stringified object
  headers?: { [key: string]: string };
}
*/

/*
 * Placeholder type definition for the imported utility function.
 * Adjust if the actual signature is different or if types are exported from the utility file.
 */
/* // --> If createApiResponse type is NOT exported, define its signature:
type CreateApiResponseFn = (
    statusCode: number,
    message: string,
    data?: any // Or specify a more concrete type like Pallet[] | null
) => ApiResponse;
*/

// Assume 'createApiResponse' is properly typed in its own file and exported.
// If not, you might need casting or the definitions above.

// --- AWS SDK Setup ---
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Fetches all open pallets from the "Pallets" table using a Scan operation.
 * Note: Scans can be inefficient and costly on large tables. Consider using a
 * Global Secondary Index (GSI) on the 'estado' field if performance becomes an issue.
 * @returns {Promise<ApiResponse>} An API-style response object.
 */
const getOpenPallets = async (): Promise<ApiResponse> => {
  console.log(`🔍 Attempting to fetch open pallets from ${PALLETS_TABLE_NAME}`);

  try {
    // 1) Define parameters for scanning only items where estado = 'open'
    const params: DocumentClient.ScanInput = {
      TableName: PALLETS_TABLE_NAME,
      // Filter expression to get only open pallets
      FilterExpression: "#statusAttribute = :openStatusValue",
      // Map '#statusAttribute' placeholder to the actual attribute name 'estado'
      ExpressionAttributeNames: {
        "#statusAttribute": "estado",
      },
      // Map ':openStatusValue' placeholder to the actual value 'open'
      ExpressionAttributeValues: {
        ":openStatusValue": "open",
      },
      // Optionally add ProjectionExpression to retrieve only necessary attributes
      // ProjectionExpression: "codigo, estado, /* other needed attributes */"
    };

    // 2) Perform the scan operation on DynamoDB
    const result: DocumentClient.ScanOutput = await dynamoDB.scan(params).promise();

    // Safely access Items, defaulting to an empty array if undefined/null
    const openPallets = (result.Items as Pallet[]) ?? [];
    const count = openPallets.length;

    console.log(`✅ Found ${count} open pallet(s).`);

    // 3) Return success response using the utility function
    return createApiResponse(
      200,
      `Successfully found ${count} open pallet(s).`,
      openPallets // Pass the array of found pallets as data
    );

  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
     // Log the detailed error
    console.error(`❌ Error fetching open pallets: ${errorMessage}`, error);

    // 4) Return error response using the utility function
    // Pass null or undefined for data in case of error, depending on createApiResponse definition
    return createApiResponse(
      500,
      `Error fetching open pallets: ${errorMessage}`,
      null
    );
  }
};

// Use default export as implied by the original module.exports
export default getOpenPallets;

// Alternatively, use named export if preferred:
// export { getOpenPallets };