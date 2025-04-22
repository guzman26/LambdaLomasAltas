import * as AWS from "aws-sdk";
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// Assuming createPallet is also converted to TypeScript and exports the function
import createPallet from "../controllers/pallets/create"; // Adjust path if necessary

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE: string = "Pallets";

/**
 * Interface for the parsed pallet code components.
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
 * Interface for the Pallet data structure in DynamoDB.
 */
interface Pallet {
    codigo: string; // Partition Key
    ubicacion: string; // e.g., "PACKING", "BODEGA", "VENTA"
    estado: 'open' | 'closed' | string; // Add other states if applicable
    cantidadCajas: number;
    cajas?: string[]; // Array of box codes
    createdAt: string; // ISO 8601 string
    updatedAt?: string; // ISO 8601 string
    // Add other pallet properties if known
}


/**
 * Parses a pallet code string into its components
 * @param {string} code - Pallet code to parse with format DSSYYHFNN... where:
 * D: day of week (1 digit)
 * SS: week of year (2 digits)
 * YY: year (2 digits)
 * H: shift (1 digit)
 * CC: caliber (2 digits)
 * F: format (1 digit)
 * N: pallet number (variable length)
 * @returns {ParsedPalletCode} Parsed pallet code components
 * @throws {Error} If code format is invalid
 */
function parsePalletCode(code: string): ParsedPalletCode {
    // Ensure code is a string and has the minimum required length for fixed parts
    if (typeof code !== 'string' || code.length < 9) {
        throw new Error(`Invalid pallet code format or length: "${code}"`);
    }

    const dayOfWeek = code.substring(0, 1);
    const weekOfYear = code.substring(1, 3);
    const year = code.substring(3, 5);
    const shift = code.substring(5, 6);
    const caliber = code.substring(6, 8);
    const format = code.substring(8, 9);
    const palletNumber = code.substring(9); // Rest of the string is the pallet number

    // Optional: Add validation for the format of extracted components if needed
    // e.g., check if dayOfWeek is 1-7, weekOfYear 01-53, year is digits, etc.
    // For simplicity, sticking to string extraction as in original JS.


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
 * Retrieves or creates a pallet in the database
 * @param {string} palletCode - Code identifying the pallet
 * @param {string} [ubicacion="PACKING"] - The initial location if creating a new pallet
 * @returns {Promise<Pallet>} The pallet object (existing or newly created)
 * @throws {Error} If pallet retrieval or creation fails
 */
export async function assignPallet(palletCode: string, ubicacion: string = "PACKING"): Promise<Pallet> {
    console.log(`🔍 Checking for pallet with code: "${palletCode}"`);

    // Validate palletCode is a non-empty string
    if (typeof palletCode !== 'string' || palletCode.length === 0) {
        throw new Error(`Pallet code must be a non-empty string, received: ${typeof palletCode}`);
    }

    try {
        // Parse the pallet code to validate format before DB operation
        // This will throw an error if the code is too short or not a string, as per parsePalletCode logic
        parsePalletCode(palletCode);

        // Attempt to retrieve existing pallet
        const params: DocumentClient.GetItemInput = {
            TableName: PALLETS_TABLE,
            Key: { codigo: palletCode },
        };

        const getResult = await dynamoDB.get(params).promise();
        let pallet: Pallet | undefined = getResult.Item as Pallet | undefined; // Type assertion

        // Create a new pallet if not found
        if (!pallet) {
            console.log(`✨ Pallet "${palletCode}" not found. Creating new pallet.`);
            // Call the createPallet function and await its result
            // createPallet returns an ApiResponse, we need to extract the pallet data from it
            const response = await createPallet(palletCode);
            // Extract the pallet data from the ApiResponse
            const responseBody = JSON.parse(response.body);
            if (responseBody.status === 'success' && responseBody.data) {
                pallet = responseBody.data as Pallet;
            } else {
                throw new Error(`Failed to create pallet: ${responseBody.message}`);
            }
            console.log(`✅ New pallet created: ${JSON.stringify(pallet)}`);
        } else {
            console.log(`✅ Found existing pallet: ${JSON.stringify(pallet)}`);
        }

        // After finding or creating, ensure a pallet object is available
        if (!pallet) {
             // This case should ideally not happen if createPallet is implemented correctly,
             // but serves as a safeguard.
             throw new Error(`Failed to retrieve or create pallet with code "${palletCode}".`);
        }


        return pallet; // Return the found or newly created pallet
    } catch (error: any) { // Use 'any' for broader compatibility with error types
        console.error("❌ Error during pallet assignment:", error);
        // Re-throw a new error with a more general message for the API layer/caller
        throw new Error(`Failed to get or create pallet: ${error.message}`);
    }
}

// Export the function for external use
export default assignPallet;