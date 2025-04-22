import * as AWS from "aws-sdk";

// Configure AWS if not already configured
// AWS.config.update({ region: "your-region" }); // Uncomment and set your region if needed

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE: string = "Pallets";
const BOXES_TABLE: string = "Boxes";

/**
 * Interface for the parsed components of the date-caliber-format string.
 */
interface ParsedFormat {
    raw: string;
    day: string;
    week: string;
    year: string;
    shift: string;
    caliber: string;
    format: string;
    dateIsoString: string;
}

/**
 * Interface for the Pallet data structure in DynamoDB.
 */
interface Pallet {
    codigo: string;
    estado: 'open' | 'closed' | string; // Assuming estado can be other strings too
    cantidadCajas: number;
    cajas?: string[]; // Array of box codes
    // Add other pallet properties if known
}

/**
 * Interface for the Box data structure in DynamoDB.
 */
interface Box {
    codigo: string;
    fecha_registro: string; // ISO 8601 string
    calibre: string;
    formato_caja: string;
    palletId?: string; // Optional, as it's added later
    // Add other box properties if known
}


/**
 * Parses a date-caliber-format string into its components
 * @param {string} fcf - 9-digit string representing date, caliber and format info
 * @returns {ParsedFormat} Parsed components
 * @throws {Error} If the format is invalid
 */
function parseDateCaliberFormat(fcf: string): ParsedFormat {
    if (typeof fcf !== 'string' || fcf.length !== 9) {
        throw new Error(`Invalid date-caliber-format: must be a 9-digit string. Received: "${fcf}"`);
    }

    const dayStr = fcf.slice(0, 1);
    const weekStr = fcf.slice(1, 3);
    const yearStr = fcf.slice(3, 5);
    const shiftStr = fcf.slice(5, 6);
    const caliberStr = fcf.slice(6, 8);
    const formatStr = fcf.slice(8);

    // Build date string (YYYY-WW-D format)
    const fullYear = `20${yearStr}`;
    // Construct ISO 8601 week date string (YYYY-Www-D)
    const dateString = `${fullYear}-W${weekStr}-${dayStr}`;


    return {
        raw: fcf,
        day: dayStr,
        week: weekStr,
        year: yearStr,
        shift: shiftStr,
        caliber: caliberStr,
        format: formatStr,
        dateIsoString: dateString // This will be in YYYY-Www-D format
    };
}

/**
 * Helper function to get the ISO week number (1-53) for a given Date object.
 * Implementation based on ISO 8601 week date standard.
 * @param {Date} date - The date to get the week number for.
 * @returns {number} The ISO week number.
 */
function getWeekNumber(date: Date): number {
    const target = new Date(date.valueOf());
    // ISO day of week (0 for Sunday, 1 for Monday... 6 for Saturday)
    const dayNr = (date.getUTCDay() + 6) % 7;
    // Set the target date to the nearest Thursday
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    // Get the first Thursday of the year
    const firstThursday = target.valueOf();
    // Set the target date to the first day of the year
    target.setUTCMonth(0, 1);
    // If the first day of the year is not a Thursday, move to the first Thursday of the year
    if (target.getUTCDay() !== 4) {
        target.setUTCDate(target.getUTCDate() + ((4 - target.getUTCDay()) + 7) % 7);
    }
    // Calculate the week number based on the difference between the target Thursday and the first Thursday of the year
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000); // 604800000 is the number of milliseconds in a week
    return weekNumber;
}

/**
 * Adds a box to a pallet, verifying compatibility
 * @param {string} palletId - The ID of the pallet
 * @param {string} boxCode - The code of the box to add
 * @returns {Promise<Pallet>} The updated pallet record
 * @throws {Error} If the operation fails or validation fails
 */
export async function addBoxToPallet(palletId: string, boxCode: string): Promise<Pallet> {
    console.log(`➕ Attempting to add box "${boxCode}" to pallet "${palletId}"...`);

    try {
        // 1. Fetch the pallet
        const getPalletResult = await dynamoDB
            .get({ TableName: PALLETS_TABLE, Key: { codigo: palletId } })
            .promise();
        const pallet: Pallet | undefined = getPalletResult.Item as Pallet | undefined;

        if (!pallet) {
            throw new Error(`Pallet "${palletId}" does not exist.`);
        }
        if (pallet.estado !== 'open') {
            throw new Error(`Pallet "${palletId}" is not open.`);
        }
        if (pallet.cantidadCajas >= 60) {
            throw new Error(`Pallet "${palletId}" is full.`);
        }

        const parsedFromCodigo: ParsedFormat = parseDateCaliberFormat(pallet.codigo.slice(0, 9));

        // 2. Fetch the box
        const getBoxResult = await dynamoDB
            .get({ TableName: BOXES_TABLE, Key: { codigo: boxCode } })
            .promise();
        const box: Box | undefined = getBoxResult.Item as Box | undefined;

        if (!box) {
            throw new Error(`Box "${boxCode}" does not exist.`);
        }

        // 3. Validate compatibility
        const boxDate = new Date(box.fecha_registro);

        // Ensure the box date is a valid date
        if (isNaN(boxDate.getTime())) {
             throw new Error(`Invalid date_registro format for box "${boxCode}": "${box.fecha_registro}"`);
        }

        // Get ISO day of week (1 for Monday, 7 for Sunday) - parseDateCaliberFormat uses 1-7, Date.getUTCDay() is 0-6
        const boxDay = String(boxDate.getUTCDay() === 0 ? 7 : boxDate.getUTCDay());
        const boxWeek = getWeekNumber(boxDate);
        const boxYear = String(boxDate.getUTCFullYear()).slice(-2);
        // Construct ISO 8601 week date string (YYYY-Www-D) for the box
        const boxDateStr = `20${boxYear}-W${String(boxWeek).padStart(2, '0')}-${boxDay}`;


        if (parsedFromCodigo.caliber !== box.calibre) {
            throw new Error(`Caliber mismatch: pallet=${parsedFromCodigo.caliber}, box=${box.calibre}`);
        }
        if (parsedFromCodigo.format !== box.formato_caja) {
            throw new Error(`Format mismatch: pallet=${parsedFromCodigo.format}, box=${box.formato_caja}`);
        }
        // Compare ISO 8601 week date strings
        if (parsedFromCodigo.dateIsoString !== boxDateStr) {
            throw new Error(`Date mismatch: pallet=${parsedFromCodigo.dateIsoString}, box=${boxDateStr}`);
        }


        // 4. Update the pallet
        let updatedPallet: Pallet;
        try {
            const updateResult = await dynamoDB.update({
                TableName: PALLETS_TABLE,
                Key: { codigo: palletId },
                UpdateExpression: "SET cajas = list_append(if_not_exists(cajas, :empty_list), :newBox), cantidadCajas = cantidadCajas + :increment",
                ConditionExpression: "attribute_not_exists(cajas) OR NOT contains(cajas, :box)",
                ExpressionAttributeValues: {
                    ':newBox': [boxCode],
                    ':empty_list': [],
                    ':increment': 1,
                    ':box': boxCode,
                },
                ReturnValues: 'ALL_NEW',
            }).promise();
            updatedPallet = updateResult.Attributes as Pallet;
        } catch (updateError: any) { // Use 'any' for broader compatibility with error types
            // Si la condición falla, significa que la caja ya está en la lista, entonces se recupera el pallet actual.
            if (updateError.code === 'ConditionalCheckFailedException') {
                console.log(`Box "${boxCode}" already exists in pallet "${palletId}". Skipping duplicate addition.`);
                const getResult = await dynamoDB.get({
                    TableName: PALLETS_TABLE,
                    Key: { codigo: palletId },
                }).promise();
                updatedPallet = getResult.Item as Pallet;
            } else {
                throw updateError;
            }
        }

        // 5. Update the box with the palletId
        await dynamoDB
            .update({
                TableName: BOXES_TABLE,
                Key: { codigo: boxCode },
                UpdateExpression: 'SET palletId = :palletId',
                ExpressionAttributeValues: {
                    ':palletId': palletId,
                },
            })
            .promise();

        console.log(`🔗 Box "${boxCode}" now linked to pallet "${palletId}"`);

        return updatedPallet;
    } catch (error: any) { // Use 'any' for broader compatibility with error types
        console.error(`❌ Error adding box to pallet: ${error.message}`);
        throw new Error(`Failed to add box to pallet: ${error.message}`);
    }
}

// No need to export module.exports in TypeScript when using ES modules (import/export)
// If targeting CommonJS, you would use:
// export = addBoxToPallet;