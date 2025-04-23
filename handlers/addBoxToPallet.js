const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE = "Pallets";
const EGGS_TABLE = "Boxes";

/**
 * Parses a date-caliber-format string into its components
 * @param {string} fcf - 9-digit string representing date, caliber and format info
 * @returns {object} Parsed components
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
    const dateString = `${fullYear}-W${weekStr}-${dayStr}`;

    return {
        raw: fcf,
        day: dayStr,
        week: weekStr,
        year: yearStr,
        shift: shiftStr,
        caliber: caliberStr,
        format: formatStr,
        dateIsoString: dateString
    };
}

/**
 * Adds a box to a pallet, verifying compatibility
 * @param {string} palletId - The ID of the pallet
 * @param {string} boxCode - The code of the box to add
 * @returns {Promise<object>} The updated pallet record
 * @throws {Error} If the operation fails or validation fails
 */
async function addBoxToPallet(palletId, boxCode) {
    console.log(`➕ Attempting to add box "${boxCode}" to pallet "${palletId}"...`);
  
    try {
      // 1. Fetch the pallet
      const { Item: pallet } = await dynamoDB
        .get({ TableName: PALLETS_TABLE, Key: { codigo: palletId } })
        .promise();
  
      if (!pallet) throw new Error(`Pallet "${palletId}" does not exist.`);
      if (pallet.estado !== 'open') throw new Error(`Pallet "${palletId}" is not open.`);
      if (pallet.cantidadCajas >= 60) throw new Error(`Pallet "${palletId}" is full.`);
  
      const parsedFromCodigo = parseDateCaliberFormat(pallet.codigo.slice(0, 9));
  
      // 2. Fetch the box
      const { Item: box } = await dynamoDB
        .get({ TableName: EGGS_TABLE, Key: { codigo: boxCode } })
        .promise();
  
      if (!box) throw new Error(`Box "${boxCode}" does not exist.`);
  
      // 3. Validate compatibility
      const boxDate = new Date(box.fecha_registro);
      const boxDay = String(boxDate.getUTCDay());
      const boxWeek = getWeekNumber(boxDate);
      const boxYear = String(boxDate.getUTCFullYear()).slice(-2);
      const boxDateStr = `20${boxYear}-W${String(boxWeek).padStart(2, '0')}-${boxDay}`;
  
      if (parsedFromCodigo.caliber !== box.calibre)
        throw new Error(`Caliber mismatch: pallet=${parsedFromCodigo.caliber}, box=${box.calibre}`);
      if (parsedFromCodigo.format !== box.formato_caja)
        throw new Error(`Format mismatch: pallet=${parsedFromCodigo.format}, box=${box.formato_caja}`);
      if (parsedFromCodigo.dateIsoString !== boxDateStr)
        throw new Error(`Date mismatch: pallet=${parsedFromCodigo.dateIsoString}, box=${boxDateStr}`);
  
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
      } catch (updateError) {
        // Si la condición falla, significa que la caja ya está en la lista, entonces se recupera el pallet actual.
        if (updateError.code === 'ConditionalCheckFailedException') {
          console.log(`Box "${boxCode}" already exists in pallet "${palletId}". Skipping duplicate addition.`);
          const getResult = await dynamoDB.get({
            TableName: PALLETS_TABLE,
            Key: { codigo: palletId },
          }).promise();
          updatedPallet = getResult.Item;
        } else {
          throw updateError;
        }
      }
  
      // 5. Update the box with the palletId
      await dynamoDB
        .update({
          TableName: EGGS_TABLE,
          Key: { codigo: boxCode },
          UpdateExpression: 'SET palletId = :palletId',
          ExpressionAttributeValues: {
            ':palletId': palletId,
          },
        })
        .promise();
  
      console.log(`🔗 Box "${boxCode}" now linked to pallet "${palletId}"`);
  
      return updatedPallet;
    } catch (error) {
      console.error(`❌ Error adding box to pallet: ${error.message}`);
      throw new Error(`Failed to add box to pallet: ${error.message}`);
    }
  }
  
function getWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setUTCMonth(0, 1);
    if (target.getUTCDay() !== 4) {
        target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
    return weekNumber;
}

module.exports = addBoxToPallet;