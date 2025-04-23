const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE = "Pallets";

/**
 * Toggles the status of a pallet between 'abierto' and 'cerrado'.
 * @param {string} codigo - The code of the pallet to update
 * @returns {Promise<object>} - The updated pallet info
 * @throws {Error} - If the pallet doesn't exist or fails validation
 */
async function togglePalletStatus(codigo) {
  console.log(`📦 Attempting to toggle status of pallet "${codigo}"...`);

  if (!codigo || typeof codigo !== "string") {
    throw new Error("Invalid or missing pallet code.");
  }

  // 1. Get the current pallet
  const getParams = {
    TableName: PALLETS_TABLE,
    Key: { codigo },
  };

  const { Item: pallet } = await dynamoDB.get(getParams).promise();

  if (!pallet) {
    throw new Error(`Pallet "${codigo}" not found.`);
  }

  const currentStatus = pallet.estado || 'open';
  const isClosed = currentStatus === 'closed';

  // 2. If closing, validate it has boxes
  if (!isClosed && (!Array.isArray(pallet.cajas) || pallet.cajas.length === 0)) {
    throw new Error(`Pallet "${codigo}" has no boxes and cannot be closed.`);
  }

  // 3. Toggle the state
  const newStatus = isClosed ? "open" : "closed";

  const updateParams = {
    TableName: PALLETS_TABLE,
    Key: { codigo },
    UpdateExpression: "SET estado = :estado",
    ExpressionAttributeValues: {
      ":estado": newStatus,
    },
    ReturnValues: "ALL_NEW",
  };

  const { Attributes: updatedPallet } = await dynamoDB.update(updateParams).promise();

  console.log(`✅ Pallet "${codigo}" updated: ${currentStatus} ➡️ ${newStatus}`);

  return updatedPallet;
}

module.exports = togglePalletStatus;
