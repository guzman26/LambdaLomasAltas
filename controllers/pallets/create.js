const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE = "Pallets";
const createApiResponse = require("../utils/response");

/**
 * Creates a new pallet, appending a unique 3-digit number to the base code.
 * @param {Object} event - Lambda event object
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
    palletNumber: code.substring(9)
  };
}

async function handleCreatePallet(codigo) {
    

  if (!codigo || codigo.length !== 9) {
    return createApiResponse(400, "Invalid or missing 'baseCode'. Must be a 9-digit string.");
  }

  try {
    // 1. Query existing pallets with the baseCode prefix
    const scanParams = {
      TableName: PALLETS_TABLE,
      FilterExpression: "begins_with(codigo, :base)",
      ExpressionAttributeValues: {
        ":base": codigo,
      },
      ProjectionExpression: "codigo"
    };

    const existingCodes = [];
    let items;
    do {
      items = await dynamoDB.scan(scanParams).promise();
      existingCodes.push(...items.Items.map(item => item.codigo));
      scanParams.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (scanParams.ExclusiveStartKey);

    // 2. Extract suffixes and find the max
    const suffixes = existingCodes
      .map(code => code.slice(9))
      .filter(suffix => /^\d{3}$/.test(suffix))
      .map(Number);

    const nextSuffix = suffixes.length === 0 ? 1 : Math.max(...suffixes) + 1;
    const finalPalletCode = `${codigo}${String(nextSuffix).padStart(3, '0')}`;
    const { dayOfWeek, weekOfYear, year, shift, caliber, format } = parsePalletCode(finalPalletCode);
    const fechaCalibreFormato = `${dayOfWeek}${weekOfYear}${year}${shift}${caliber}${format}`;
    // 3. Create the pallet
    const newPallet = {
      codigo: finalPalletCode,
      fechaCalibreFormato,
      estado: "open",
      cajas: [],
      cantidadCajas: 0,
      fechaCreacion: new Date().toISOString(),
      ubicacion: "PACKING"
    };

    await dynamoDB.put({
      TableName: PALLETS_TABLE,
      Item: newPallet
    }).promise();
    console.log("✅ Pallet created successfully:", newPallet);

    return createApiResponse(201, "Pallet created successfully", newPallet);
  } catch (err) {
    console.error("❌ Error creating pallet:", err);
    return createApiResponse(500, "Failed to create pallet", { error: err.message });
  }
}

module.exports = handleCreatePallet;
