const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const createPallet = require('./createPallet');

const PALLETS_TABLE = 'Pallets';

/**
 * Parses a pallet code string into its components
 * @param {string} code - Pallet code to parse with format DSSYYHTCCFN where:
 *   D: day of week (1 digit)
 *   SS: week of year (2 digits)
 *   YY: year (2 digits)
 *   H: shift (1 digit)
 *   CC: caliber (2 digits)
 *   F: format (1 digit)
 *   N: pallet number (variable length)
 * @returns {object} Parsed pallet code components
 * @throws {Error} If code format is invalid
 */
function parsePalletCode(code) {
  if (!code || code.length < 9) {
    throw new Error(`Invalid pallet code: "${code}"`);
  }

  return {
    dayOfWeek: code.substring(0, 1),
    weekOfYear: code.substring(1, 3),
    year: code.substring(3, 5),
    shift: code.substring(5, 6),
    caliber: code.substring(6, 8),
    format: code.substring(8, 9),
    palletNumber: code.substring(9),
  };
}

/**
 * Retrieves or creates a pallet in the database
 * @param {string} palletCode - Code identifying the pallet
 * @returns {Promise<object>} The pallet object (existing or newly created)
 * @throws {Error} If pallet retrieval or creation fails
 */
async function assignPallet(palletCode, ubicacion = 'PACKING') {
  console.log(`🔍 Checking for pallet with code: "${palletCode}"`);

  // Validate palletCode is a string
  if (typeof palletCode !== 'string') {
    throw new Error(`Pallet code must be a string, received: ${typeof palletCode}`);
  }

  try {
    // Parse the pallet code
    const { dayOfWeek, weekOfYear, year, shift, caliber, format } = parsePalletCode(palletCode);

    // Attempt to retrieve existing pallet
    const params = {
      TableName: PALLETS_TABLE,
      Key: { codigo: palletCode },
    };

    const getResult = await dynamoDB.get(params).promise();
    let pallet = getResult.Item;

    // Create a new pallet if not found
    if (!pallet) {
      createPallet(palletCode, ubicacion);
    } else {
      console.log(`✅ Found existing pallet: ${JSON.stringify(pallet)}`);
    }

    return pallet;
  } catch (error) {
    console.error('❌ Error during pallet assignment:', error);
    throw new Error(`Failed to get or create pallet: ${error.message}`);
  }
}

module.exports = assignPallet;
