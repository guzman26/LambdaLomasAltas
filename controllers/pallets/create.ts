import * as AWS from "aws-sdk";
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// Assuming createApiResponse is also converted to TypeScript and exports the function and type
import createApiResponse from "../../utils/response"; // Adjust path if necessary
import { ApiResponse } from "../../types"; // Import from types instead of response


const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE: string = "Pallets";

/**
 * Interface for the parsed pallet code components.
 * Note: This interface and function seem intended for *full* pallet codes (>= 12 chars),
 * but handleCreatePallet uses them with a 9-digit base code, which might be a mismatch.
 * Keeping it as is for the conversion but noting the potential confusion.
 */
interface ParsedPalletCode {
    dayOfWeek: string;
    weekOfYear: string;
    year: string;
    shift: string;
    caliber: string;
    format: string;
    palletNumber: string; // Can be variable length
}

/**
 * Interface for the Pallet data structure as created/expected by this function.
 */
interface Pallet {
    codigo: string; // Full pallet code (e.g., DSSYYHFNNN) - Partition Key
    fechaCalibreFormato: string; // DSSYYHF string part for querying/grouping?
    estado: "open" | "closed" | string; // Add other states if applicable
    cajas: string[]; // Array of box codes
    cantidadCajas: number;
    fechaCreacion: string; // ISO 8601 string
    ubicacion: string; // e.g., "PACKING"
    // Add other pallet properties if known
}

/**
 * Parses a pallet code string into its components
 * @param {string} code - Pallet code to parse with format DSSYYHFNNN...
 * @returns {ParsedPalletCode} Parsed pallet code components
 * @throws {Error} If code format is invalid
 */
function parsePalletCode(code: string): ParsedPalletCode {
  // Ensure code is a string and has the minimum required length for fixed parts
  if (typeof code !== 'string' || code.length < 9) {
    throw new Error(`Invalid pallet code format or length: "${code}"`);
  }

  // Note: This parsing assumes a full pallet code like DSSYYHFNNN.
  // If used with just the 9-digit base code, `palletNumber` will be empty.
  const dayOfWeek = code.substring(0, 1);
  const weekOfYear = code.substring(1, 3);
  const year = code.substring(3, 5);
  const shift = code.substring(5, 6);
  const caliber = code.substring(6, 8);
  const format = code.substring(8, 9);
  const palletNumber = code.substring(9); // Rest of the string is the pallet number

  return {
    dayOfWeek,
    weekOfYear,
    year,
    shift,
    caliber,
    format,
    palletNumber
  };
}


/**
 * Handles the creation of a new pallet, appending a unique 3-digit number to the base code.
 * @param {string} baseCode - The 9-digit base code (DSSYYHF)
 * @returns {Promise<ApiResponse>} API response with the created pallet or an error.
 */
export async function handleCreatePallet(baseCode: string): Promise<ApiResponse> {

  // Validate the input baseCode
  if (typeof baseCode !== 'string' || baseCode.length !== 9) {
    return createApiResponse(400, "Invalid or missing 'baseCode'. Must be a 9-digit string.");
  }

  try {
    // 1. Query existing pallets with the baseCode prefix
    const scanParams: DocumentClient.ScanInput = {
      TableName: PALLETS_TABLE,
      FilterExpression: "begins_with(codigo, :base)",
      ExpressionAttributeValues: {
        ":base": baseCode,
      },
      ProjectionExpression: "codigo" // Only retrieve the 'codigo' attribute
    };

    const existingCodes: string[] = [];
    let items: DocumentClient.ScanOutput;
    let lastEvaluatedKey: DocumentClient.Key | undefined;

    // Use pagination for scan
    do {
      items = await dynamoDB.scan({
          ...scanParams,
          ExclusiveStartKey: lastEvaluatedKey
      }).promise();

      if (items.Items) {
         // Map items to their 'codigo' and add to existingCodes
         existingCodes.push(...items.Items.map(item => (item as { codigo: string }).codigo));
      }

      lastEvaluatedKey = items.LastEvaluatedKey;
    } while (lastEvaluatedKey);


    // 2. Extract suffixes and find the max
    const suffixes: number[] = existingCodes
      .map(code => code.slice(9)) // Get the part after the 9-digit base code
      .filter(suffix => /^\d{3}$/.test(suffix)) // Keep only 3-digit numerical suffixes
      .map(Number); // Convert valid suffixes to numbers

    // Calculate the next suffix: 1 if no existing suffixes, otherwise max + 1
    const nextSuffix = suffixes.length === 0 ? 1 : Math.max(...suffixes) + 1;

    // Format the next suffix as a 3-digit string
    const nextSuffixString = String(nextSuffix).padStart(3, '0');

    // Construct the final pallet code
    const finalPalletCode = `${baseCode}${nextSuffixString}`;

    // Reconstruct fechaCalibreFormato from the baseCode (first 9 digits)
    // Note: Using parsePalletCode here with the *full* code would include the new suffix,
    // which might not be what 'fechaCalibreFormato' is intended to store (usually just the production date/caliber/format).
    // Sticking to deriving it from the *baseCode* as implied by original variable naming,
    // but the original code derived it from `finalPalletCode` which is potentially a bug.
    // Let's stick to the original JS behavior of deriving from `finalPalletCode` for a direct conversion,
    // but note this might be logically incorrect if fechaCalibreFormato should only contain the first 9 chars.
    // Based on the original code:
    // const { dayOfWeek, weekOfYear, year, shift, caliber, format } = parsePalletCode(finalPalletCode);
    // const fechaCalibreFormato = `${dayOfWeek}${weekOfYear}${year}${shift}${caliber}${format}`;
    // This approach re-parses the *full* code, which includes the generated number.
    // It seems more likely 'fechaCalibreFormato' is just the original 9-digit base code.
    // Let's assume 'fechaCalibreFormato' is just the baseCode for logical correctness,
    // although the original JS code's derivation from `finalPalletCode` is ambiguous.
    const fechaCalibreFormato: string = baseCode; // Assuming this should just be the input base code

    // If the original code *intended* to use the parsed components from the *full* code,
    // the derivation would be like this (but less likely for a field named fechaCalibreFormato):
    // const parsedFullCode = parsePalletCode(finalPalletCode);
    // const fechaCalibreFormato = `${parsedFullCode.dayOfWeek}${parsedFullCode.weekOfYear}${parsedFullCode.year}${parsedFullCode.shift}${parsedFullCode.caliber}${parsedFullCode.format}`;
    // Let's assume `fechaCalibreFormato` is simply the `baseCode` for now.

    // 3. Create the pallet item structure
    const newPallet: Pallet = {
      codigo: finalPalletCode, // Full code with sequence number
      fechaCalibreFormato: fechaCalibreFormato, // The 9-digit base code
      estado: "open",
      cajas: [], // Start with an empty array of boxes
      cantidadCajas: 0,
      fechaCreacion: new Date().toISOString(),
      ubicacion: "PACKING" // Default location
      // Add other required fields as per your Pallet schema
    };

    // 4. Put the new pallet item into DynamoDB
    const putParams: DocumentClient.PutItemInput = {
      TableName: PALLETS_TABLE,
      Item: newPallet as any // Type assertion because PutItem expects a generic ItemCollection
    };

    await dynamoDB.put(putParams).promise();
    console.log("✅ Pallet created successfully:", newPallet);

    // 5. Return success API response
    return createApiResponse(201, "Pallet created successfully", newPallet);

  } catch (err: any) { // Use 'any' for broader compatibility with error types
    console.error("❌ Error creating pallet:", err);
    // Return error API response
    return createApiResponse(500, "Failed to create pallet", { error: err.message });
  }
}

// Export the function for external use
export default handleCreatePallet;