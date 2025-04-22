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
exports.addBoxToPallet = addBoxToPallet;
const AWS = __importStar(require("aws-sdk"));
// Configure AWS if not already configured
// AWS.config.update({ region: "your-region" }); // Uncomment and set your region if needed
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PALLETS_TABLE = "Pallets";
const BOXES_TABLE = "Boxes";
/**
 * Parses a date-caliber-format string into its components
 * @param {string} fcf - 9-digit string representing date, caliber and format info
 * @returns {ParsedFormat} Parsed components
 * @throws {Error} If the format is invalid
 */
function parseDateCaliberFormat(fcf) {
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
function getWeekNumber(date) {
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
async function addBoxToPallet(palletId, boxCode) {
    console.log(`➕ Attempting to add box "${boxCode}" to pallet "${palletId}"...`);
    try {
        // 1. Fetch the pallet
        const getPalletResult = await dynamoDB
            .get({ TableName: PALLETS_TABLE, Key: { codigo: palletId } })
            .promise();
        const pallet = getPalletResult.Item;
        if (!pallet) {
            throw new Error(`Pallet "${palletId}" does not exist.`);
        }
        if (pallet.estado !== 'open') {
            throw new Error(`Pallet "${palletId}" is not open.`);
        }
        if (pallet.cantidadCajas >= 60) {
            throw new Error(`Pallet "${palletId}" is full.`);
        }
        const parsedFromCodigo = parseDateCaliberFormat(pallet.codigo.slice(0, 9));
        // 2. Fetch the box
        const getBoxResult = await dynamoDB
            .get({ TableName: BOXES_TABLE, Key: { codigo: boxCode } })
            .promise();
        const box = getBoxResult.Item;
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
        let updatedPallet;
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
            updatedPallet = updateResult.Attributes;
        }
        catch (updateError) { // Use 'any' for broader compatibility with error types
            // Si la condición falla, significa que la caja ya está en la lista, entonces se recupera el pallet actual.
            if (updateError.code === 'ConditionalCheckFailedException') {
                console.log(`Box "${boxCode}" already exists in pallet "${palletId}". Skipping duplicate addition.`);
                const getResult = await dynamoDB.get({
                    TableName: PALLETS_TABLE,
                    Key: { codigo: palletId },
                }).promise();
                updatedPallet = getResult.Item;
            }
            else {
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
    }
    catch (error) { // Use 'any' for broader compatibility with error types
        console.error(`❌ Error adding box to pallet: ${error.message}`);
        throw new Error(`Failed to add box to pallet: ${error.message}`);
    }
}
// No need to export module.exports in TypeScript when using ES modules (import/export)
// If targeting CommonJS, you would use:
// export = addBoxToPallet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkQm94VG9QYWxsZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9oYW5kbGVycy9hZGRCb3hUb1BhbGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9IQSx3Q0E4R0M7QUFsT0QsNkNBQStCO0FBRS9CLDBDQUEwQztBQUMxQywyRkFBMkY7QUFFM0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRW5ELE1BQU0sYUFBYSxHQUFXLFNBQVMsQ0FBQztBQUN4QyxNQUFNLFdBQVcsR0FBVyxPQUFPLENBQUM7QUF3Q3BDOzs7OztHQUtHO0FBQ0gsU0FBUyxzQkFBc0IsQ0FBQyxHQUFXO0lBQ3ZDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDOUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxRUFBcUUsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEMsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJ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QUFFLENBQUMsQ0FBQztJQUNyRSxDQUFDO0FBQ0wsQ0FBQztBQUVELHVGQUF1RjtBQUN2Rix3Q0FBd0M7QUFDeEMsMkJBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XG5cbi8vIENvbmZpZ3VyZSBBV1MgaWYgbm90IGFscmVhZHkgY29uZmlndXJlZFxuLy8gQVdTLmNvbmZpZy51cGRhdGUoeyByZWdpb246IFwieW91ci1yZWdpb25cIiB9KTsgLy8gVW5jb21tZW50IGFuZCBzZXQgeW91ciByZWdpb24gaWYgbmVlZGVkXG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IEFXUy5EeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG5jb25zdCBQQUxMRVRTX1RBQkxFOiBzdHJpbmcgPSBcIlBhbGxldHNcIjtcbmNvbnN0IEJPWEVTX1RBQkxFOiBzdHJpbmcgPSBcIkJveGVzXCI7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgcGFyc2VkIGNvbXBvbmVudHMgb2YgdGhlIGRhdGUtY2FsaWJlci1mb3JtYXQgc3RyaW5nLlxuICovXG5pbnRlcmZhY2UgUGFyc2VkRm9ybWF0IHtcbiAgICByYXc6IHN0cmluZztcbiAgICBkYXk6IHN0cmluZztcbiAgICB3ZWVrOiBzdHJpbmc7XG4gICAgeWVhcjogc3RyaW5nO1xuICAgIHNoaWZ0OiBzdHJpbmc7XG4gICAgY2FsaWJlcjogc3RyaW5nO1xuICAgIGZvcm1hdDogc3RyaW5nO1xuICAgIGRhdGVJc29TdHJpbmc6IHN0cmluZztcbn1cblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBQYWxsZXQgZGF0YSBzdHJ1Y3R1cmUgaW4gRHluYW1vREIuXG4gKi9cbmludGVyZmFjZSBQYWxsZXQge1xuICAgIGNvZGlnbzogc3RyaW5nO1xuICAgIGVzdGFkbzogJ29wZW4nIHwgJ2Nsb3NlZCcgfCBzdHJpbmc7IC8vIEFzc3VtaW5nIGVzdGFkbyBjYW4gYmUgb3RoZXIgc3RyaW5ncyB0b29cbiAgICBjYW50aWRhZENhamFzOiBudW1iZXI7XG4gICAgY2FqYXM/OiBzdHJpbmdbXTsgLy8gQXJyYXkgb2YgYm94IGNvZGVzXG4gICAgLy8gQWRkIG90aGVyIHBhbGxldCBwcm9wZXJ0aWVzIGlmIGtub3duXG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgQm94IGRhdGEgc3RydWN0dXJlIGluIER5bmFtb0RCLlxuICovXG5pbnRlcmZhY2UgQm94IHtcbiAgICBjb2RpZ286IHN0cmluZztcbiAgICBmZWNoYV9yZWdpc3Rybzogc3RyaW5nOyAvLyBJU08gODYwMSBzdHJpbmdcbiAgICBjYWxpYnJlOiBzdHJpbmc7XG4gICAgZm9ybWF0b19jYWphOiBzdHJpbmc7XG4gICAgcGFsbGV0SWQ/OiBzdHJpbmc7IC8vIE9wdGlvbmFsLCBhcyBpdCdzIGFkZGVkIGxhdGVyXG4gICAgLy8gQWRkIG90aGVyIGJveCBwcm9wZXJ0aWVzIGlmIGtub3duXG59XG5cblxuLyoqXG4gKiBQYXJzZXMgYSBkYXRlLWNhbGliZXItZm9ybWF0IHN0cmluZyBpbnRvIGl0cyBjb21wb25lbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gZmNmIC0gOS1kaWdpdCBzdHJpbmcgcmVwcmVzZW50aW5nIGRhdGUsIGNhbGliZXIgYW5kIGZvcm1hdCBpbmZvXG4gKiBAcmV0dXJucyB7UGFyc2VkRm9ybWF0fSBQYXJzZWQgY29tcG9uZW50c1xuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBmb3JtYXQgaXMgaW52YWxpZFxuICovXG5mdW5jdGlvbiBwYXJzZURhdGVDYWxpYmVyRm9ybWF0KGZjZjogc3RyaW5nKTogUGFyc2VkRm9ybWF0IHtcbiAgICBpZiAodHlwZW9mIGZjZiAhPT0gJ3N0cmluZycgfHwgZmNmLmxlbmd0aCAhPT0gOSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZGF0ZS1jYWxpYmVyLWZvcm1hdDogbXVzdCBiZSBhIDktZGlnaXQgc3RyaW5nLiBSZWNlaXZlZDogXCIke2ZjZn1cImApO1xuICAgIH1cblxuICAgIGNvbnN0IGRheVN0ciA9IGZjZi5zbGljZSgwLCAxKTtcbiAgICBjb25zdCB3ZWVrU3RyID0gZmNmLnNsaWNlKDEsIDMpO1xuICAgIGNvbnN0IHllYXJTdHIgPSBmY2Yuc2xpY2UoMywgNSk7XG4gICAgY29uc3Qgc2hpZnRTdHIgPSBmY2Yuc2xpY2UoNSwgNik7XG4gICAgY29uc3QgY2FsaWJlclN0ciA9IGZjZi5zbGljZSg2LCA4KTtcbiAgICBjb25zdCBmb3JtYXRTdHIgPSBmY2Yuc2xpY2UoOCk7XG5cbiAgICAvLyBCdWlsZCBkYXRlIHN0cmluZyAoWVlZWS1XVy1EIGZvcm1hdClcbiAgICBjb25zdCBmdWxsWWVhciA9IGAyMCR7eWVhclN0cn1gO1xuICAgIC8vIENvbnN0cnVjdCBJU08gODYwMSB3ZWVrIGRhdGUgc3RyaW5nIChZWVlZLVd3dy1EKVxuICAgIGNvbnN0IGRhdGVTdHJpbmcgPSBgJHtmdWxsWWVhcn0tVyR7d2Vla1N0cn0tJHtkYXlTdHJ9YDtcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmF3OiBmY2YsXG4gICAgICAgIGRheTogZGF5U3RyLFxuICAgICAgICB3ZWVrOiB3ZWVrU3RyLFxuICAgICAgICB5ZWFyOiB5ZWFyU3RyLFxuICAgICAgICBzaGlmdDogc2hpZnRTdHIsXG4gICAgICAgIGNhbGliZXI6IGNhbGliZXJTdHIsXG4gICAgICAgIGZvcm1hdDogZm9ybWF0U3RyLFxuICAgICAgICBkYXRlSXNvU3RyaW5nOiBkYXRlU3RyaW5nIC8vIFRoaXMgd2lsbCBiZSBpbiBZWVlZLVd3dy1EIGZvcm1hdFxuICAgIH07XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGdldCB0aGUgSVNPIHdlZWsgbnVtYmVyICgxLTUzKSBmb3IgYSBnaXZlbiBEYXRlIG9iamVjdC5cbiAqIEltcGxlbWVudGF0aW9uIGJhc2VkIG9uIElTTyA4NjAxIHdlZWsgZGF0ZSBzdGFuZGFyZC5cbiAqIEBwYXJhbSB7RGF0ZX0gZGF0ZSAtIFRoZSBkYXRlIHRvIGdldCB0aGUgd2VlayBudW1iZXIgZm9yLlxuICogQHJldHVybnMge251bWJlcn0gVGhlIElTTyB3ZWVrIG51bWJlci5cbiAqL1xuZnVuY3Rpb24gZ2V0V2Vla051bWJlcihkYXRlOiBEYXRlKTogbnVtYmVyIHtcbiAgICBjb25zdCB0YXJnZXQgPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XG4gICAgLy8gSVNPIGRheSBvZiB3ZWVrICgwIGZvciBTdW5kYXksIDEgZm9yIE1vbmRheS4uLiA2IGZvciBTYXR1cmRheSlcbiAgICBjb25zdCBkYXlOciA9IChkYXRlLmdldFVUQ0RheSgpICsgNikgJSA3O1xuICAgIC8vIFNldCB0aGUgdGFyZ2V0IGRhdGUgdG8gdGhlIG5lYXJlc3QgVGh1cnNkYXlcbiAgICB0YXJnZXQuc2V0VVRDRGF0ZSh0YXJnZXQuZ2V0VVRDRGF0ZSgpIC0gZGF5TnIgKyAzKTtcbiAgICAvLyBHZXQgdGhlIGZpcnN0IFRodXJzZGF5IG9mIHRoZSB5ZWFyXG4gICAgY29uc3QgZmlyc3RUaHVyc2RheSA9IHRhcmdldC52YWx1ZU9mKCk7XG4gICAgLy8gU2V0IHRoZSB0YXJnZXQgZGF0ZSB0byB0aGUgZmlyc3QgZGF5IG9mIHRoZSB5ZWFyXG4gICAgdGFyZ2V0LnNldFVUQ01vbnRoKDAsIDEpO1xuICAgIC8vIElmIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHllYXIgaXMgbm90IGEgVGh1cnNkYXksIG1vdmUgdG8gdGhlIGZpcnN0IFRodXJzZGF5IG9mIHRoZSB5ZWFyXG4gICAgaWYgKHRhcmdldC5nZXRVVENEYXkoKSAhPT0gNCkge1xuICAgICAgICB0YXJnZXQuc2V0VVRDRGF0ZSh0YXJnZXQuZ2V0VVRDRGF0ZSgpICsgKCg0IC0gdGFyZ2V0LmdldFVUQ0RheSgpKSArIDcpICUgNyk7XG4gICAgfVxuICAgIC8vIENhbGN1bGF0ZSB0aGUgd2VlayBudW1iZXIgYmFzZWQgb24gdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdGFyZ2V0IFRodXJzZGF5IGFuZCB0aGUgZmlyc3QgVGh1cnNkYXkgb2YgdGhlIHllYXJcbiAgICBjb25zdCB3ZWVrTnVtYmVyID0gMSArIE1hdGguY2VpbCgoZmlyc3RUaHVyc2RheSAtIHRhcmdldC52YWx1ZU9mKCkpIC8gNjA0ODAwMDAwKTsgLy8gNjA0ODAwMDAwIGlzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGluIGEgd2Vla1xuICAgIHJldHVybiB3ZWVrTnVtYmVyO1xufVxuXG4vKipcbiAqIEFkZHMgYSBib3ggdG8gYSBwYWxsZXQsIHZlcmlmeWluZyBjb21wYXRpYmlsaXR5XG4gKiBAcGFyYW0ge3N0cmluZ30gcGFsbGV0SWQgLSBUaGUgSUQgb2YgdGhlIHBhbGxldFxuICogQHBhcmFtIHtzdHJpbmd9IGJveENvZGUgLSBUaGUgY29kZSBvZiB0aGUgYm94IHRvIGFkZFxuICogQHJldHVybnMge1Byb21pc2U8UGFsbGV0Pn0gVGhlIHVwZGF0ZWQgcGFsbGV0IHJlY29yZFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBvcGVyYXRpb24gZmFpbHMgb3IgdmFsaWRhdGlvbiBmYWlsc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQm94VG9QYWxsZXQocGFsbGV0SWQ6IHN0cmluZywgYm94Q29kZTogc3RyaW5nKTogUHJvbWlzZTxQYWxsZXQ+IHtcbiAgICBjb25zb2xlLmxvZyhg4p6VIEF0dGVtcHRpbmcgdG8gYWRkIGJveCBcIiR7Ym94Q29kZX1cIiB0byBwYWxsZXQgXCIke3BhbGxldElkfVwiLi4uYCk7XG5cbiAgICB0cnkge1xuICAgICAgICAvLyAxLiBGZXRjaCB0aGUgcGFsbGV0XG4gICAgICAgIGNvbnN0IGdldFBhbGxldFJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCXG4gICAgICAgICAgICAuZ2V0KHsgVGFibGVOYW1lOiBQQUxMRVRTX1RBQkxFLCBLZXk6IHsgY29kaWdvOiBwYWxsZXRJZCB9IH0pXG4gICAgICAgICAgICAucHJvbWlzZSgpO1xuICAgICAgICBjb25zdCBwYWxsZXQ6IFBhbGxldCB8IHVuZGVmaW5lZCA9IGdldFBhbGxldFJlc3VsdC5JdGVtIGFzIFBhbGxldCB8IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoIXBhbGxldCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQYWxsZXQgXCIke3BhbGxldElkfVwiIGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYWxsZXQuZXN0YWRvICE9PSAnb3BlbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGFsbGV0IFwiJHtwYWxsZXRJZH1cIiBpcyBub3Qgb3Blbi5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFsbGV0LmNhbnRpZGFkQ2FqYXMgPj0gNjApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGFsbGV0IFwiJHtwYWxsZXRJZH1cIiBpcyBmdWxsLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFyc2VkRnJvbUNvZGlnbzogUGFyc2VkRm9ybWF0ID0gcGFyc2VEYXRlQ2FsaWJlckZvcm1hdChwYWxsZXQuY29kaWdvLnNsaWNlKDAsIDkpKTtcblxuICAgICAgICAvLyAyLiBGZXRjaCB0aGUgYm94XG4gICAgICAgIGNvbnN0IGdldEJveFJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCXG4gICAgICAgICAgICAuZ2V0KHsgVGFibGVOYW1lOiBCT1hFU19UQUJMRSwgS2V5OiB7IGNvZGlnbzogYm94Q29kZSB9IH0pXG4gICAgICAgICAgICAucHJvbWlzZSgpO1xuICAgICAgICBjb25zdCBib3g6IEJveCB8IHVuZGVmaW5lZCA9IGdldEJveFJlc3VsdC5JdGVtIGFzIEJveCB8IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoIWJveCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCb3ggXCIke2JveENvZGV9XCIgZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzLiBWYWxpZGF0ZSBjb21wYXRpYmlsaXR5XG4gICAgICAgIGNvbnN0IGJveERhdGUgPSBuZXcgRGF0ZShib3guZmVjaGFfcmVnaXN0cm8pO1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGUgYm94IGRhdGUgaXMgYSB2YWxpZCBkYXRlXG4gICAgICAgIGlmIChpc05hTihib3hEYXRlLmdldFRpbWUoKSkpIHtcbiAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZGF0ZV9yZWdpc3RybyBmb3JtYXQgZm9yIGJveCBcIiR7Ym94Q29kZX1cIjogXCIke2JveC5mZWNoYV9yZWdpc3Ryb31cImApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IElTTyBkYXkgb2Ygd2VlayAoMSBmb3IgTW9uZGF5LCA3IGZvciBTdW5kYXkpIC0gcGFyc2VEYXRlQ2FsaWJlckZvcm1hdCB1c2VzIDEtNywgRGF0ZS5nZXRVVENEYXkoKSBpcyAwLTZcbiAgICAgICAgY29uc3QgYm94RGF5ID0gU3RyaW5nKGJveERhdGUuZ2V0VVRDRGF5KCkgPT09IDAgPyA3IDogYm94RGF0ZS5nZXRVVENEYXkoKSk7XG4gICAgICAgIGNvbnN0IGJveFdlZWsgPSBnZXRXZWVrTnVtYmVyKGJveERhdGUpO1xuICAgICAgICBjb25zdCBib3hZZWFyID0gU3RyaW5nKGJveERhdGUuZ2V0VVRDRnVsbFllYXIoKSkuc2xpY2UoLTIpO1xuICAgICAgICAvLyBDb25zdHJ1Y3QgSVNPIDg2MDEgd2VlayBkYXRlIHN0cmluZyAoWVlZWS1Xd3ctRCkgZm9yIHRoZSBib3hcbiAgICAgICAgY29uc3QgYm94RGF0ZVN0ciA9IGAyMCR7Ym94WWVhcn0tVyR7U3RyaW5nKGJveFdlZWspLnBhZFN0YXJ0KDIsICcwJyl9LSR7Ym94RGF5fWA7XG5cblxuICAgICAgICBpZiAocGFyc2VkRnJvbUNvZGlnby5jYWxpYmVyICE9PSBib3guY2FsaWJyZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYWxpYmVyIG1pc21hdGNoOiBwYWxsZXQ9JHtwYXJzZWRGcm9tQ29kaWdvLmNhbGliZXJ9LCBib3g9JHtib3guY2FsaWJyZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyc2VkRnJvbUNvZGlnby5mb3JtYXQgIT09IGJveC5mb3JtYXRvX2NhamEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRm9ybWF0IG1pc21hdGNoOiBwYWxsZXQ9JHtwYXJzZWRGcm9tQ29kaWdvLmZvcm1hdH0sIGJveD0ke2JveC5mb3JtYXRvX2NhamF9YCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ29tcGFyZSBJU08gODYwMSB3ZWVrIGRhdGUgc3RyaW5nc1xuICAgICAgICBpZiAocGFyc2VkRnJvbUNvZGlnby5kYXRlSXNvU3RyaW5nICE9PSBib3hEYXRlU3RyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERhdGUgbWlzbWF0Y2g6IHBhbGxldD0ke3BhcnNlZEZyb21Db2RpZ28uZGF0ZUlzb1N0cmluZ30sIGJveD0ke2JveERhdGVTdHJ9YCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIDQuIFVwZGF0ZSB0aGUgcGFsbGV0XG4gICAgICAgIGxldCB1cGRhdGVkUGFsbGV0OiBQYWxsZXQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVSZXN1bHQgPSBhd2FpdCBkeW5hbW9EQi51cGRhdGUoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogUEFMTEVUU19UQUJMRSxcbiAgICAgICAgICAgICAgICBLZXk6IHsgY29kaWdvOiBwYWxsZXRJZCB9LFxuICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IFwiU0VUIGNhamFzID0gbGlzdF9hcHBlbmQoaWZfbm90X2V4aXN0cyhjYWphcywgOmVtcHR5X2xpc3QpLCA6bmV3Qm94KSwgY2FudGlkYWRDYWphcyA9IGNhbnRpZGFkQ2FqYXMgKyA6aW5jcmVtZW50XCIsXG4gICAgICAgICAgICAgICAgQ29uZGl0aW9uRXhwcmVzc2lvbjogXCJhdHRyaWJ1dGVfbm90X2V4aXN0cyhjYWphcykgT1IgTk9UIGNvbnRhaW5zKGNhamFzLCA6Ym94KVwiLFxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgJzpuZXdCb3gnOiBbYm94Q29kZV0sXG4gICAgICAgICAgICAgICAgICAgICc6ZW1wdHlfbGlzdCc6IFtdLFxuICAgICAgICAgICAgICAgICAgICAnOmluY3JlbWVudCc6IDEsXG4gICAgICAgICAgICAgICAgICAgICc6Ym94JzogYm94Q29kZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFJldHVyblZhbHVlczogJ0FMTF9ORVcnLFxuICAgICAgICAgICAgfSkucHJvbWlzZSgpO1xuICAgICAgICAgICAgdXBkYXRlZFBhbGxldCA9IHVwZGF0ZVJlc3VsdC5BdHRyaWJ1dGVzIGFzIFBhbGxldDtcbiAgICAgICAgfSBjYXRjaCAodXBkYXRlRXJyb3I6IGFueSkgeyAvLyBVc2UgJ2FueScgZm9yIGJyb2FkZXIgY29tcGF0aWJpbGl0eSB3aXRoIGVycm9yIHR5cGVzXG4gICAgICAgICAgICAvLyBTaSBsYSBjb25kaWNpw7NuIGZhbGxhLCBzaWduaWZpY2EgcXVlIGxhIGNhamEgeWEgZXN0w6EgZW4gbGEgbGlzdGEsIGVudG9uY2VzIHNlIHJlY3VwZXJhIGVsIHBhbGxldCBhY3R1YWwuXG4gICAgICAgICAgICBpZiAodXBkYXRlRXJyb3IuY29kZSA9PT0gJ0NvbmRpdGlvbmFsQ2hlY2tGYWlsZWRFeGNlcHRpb24nKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEJveCBcIiR7Ym94Q29kZX1cIiBhbHJlYWR5IGV4aXN0cyBpbiBwYWxsZXQgXCIke3BhbGxldElkfVwiLiBTa2lwcGluZyBkdXBsaWNhdGUgYWRkaXRpb24uYCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2V0UmVzdWx0ID0gYXdhaXQgZHluYW1vREIuZ2V0KHtcbiAgICAgICAgICAgICAgICAgICAgVGFibGVOYW1lOiBQQUxMRVRTX1RBQkxFLFxuICAgICAgICAgICAgICAgICAgICBLZXk6IHsgY29kaWdvOiBwYWxsZXRJZCB9LFxuICAgICAgICAgICAgICAgIH0pLnByb21pc2UoKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVkUGFsbGV0ID0gZ2V0UmVzdWx0Lkl0ZW0gYXMgUGFsbGV0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyB1cGRhdGVFcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDUuIFVwZGF0ZSB0aGUgYm94IHdpdGggdGhlIHBhbGxldElkXG4gICAgICAgIGF3YWl0IGR5bmFtb0RCXG4gICAgICAgICAgICAudXBkYXRlKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IEJPWEVTX1RBQkxFLFxuICAgICAgICAgICAgICAgIEtleTogeyBjb2RpZ286IGJveENvZGUgfSxcbiAgICAgICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiAnU0VUIHBhbGxldElkID0gOnBhbGxldElkJyxcbiAgICAgICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICc6cGFsbGV0SWQnOiBwYWxsZXRJZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5wcm9taXNlKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYPCflJcgQm94IFwiJHtib3hDb2RlfVwiIG5vdyBsaW5rZWQgdG8gcGFsbGV0IFwiJHtwYWxsZXRJZH1cImApO1xuXG4gICAgICAgIHJldHVybiB1cGRhdGVkUGFsbGV0O1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHsgLy8gVXNlICdhbnknIGZvciBicm9hZGVyIGNvbXBhdGliaWxpdHkgd2l0aCBlcnJvciB0eXBlc1xuICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRXJyb3IgYWRkaW5nIGJveCB0byBwYWxsZXQ6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gYWRkIGJveCB0byBwYWxsZXQ6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG59XG5cbi8vIE5vIG5lZWQgdG8gZXhwb3J0IG1vZHVsZS5leHBvcnRzIGluIFR5cGVTY3JpcHQgd2hlbiB1c2luZyBFUyBtb2R1bGVzIChpbXBvcnQvZXhwb3J0KVxuLy8gSWYgdGFyZ2V0aW5nIENvbW1vbkpTLCB5b3Ugd291bGQgdXNlOlxuLy8gZXhwb3J0ID0gYWRkQm94VG9QYWxsZXQ7Il19