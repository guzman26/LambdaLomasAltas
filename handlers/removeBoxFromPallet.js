const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PALLETS_TABLE = "Pallets";
const EGGS_TABLE    = "Boxes";

/**
 * Elimina una caja de un pallet y actualiza la caja quitándole el palletId.
 * @param {string} palletId - ID del pallet del cual vamos a extraer la caja.
 * @param {string} boxCode  - Código de la caja a remover.
 * @returns {Promise<{ updatedPallet: object, updatedBox: object }>}
 *          El pallet y la caja ya actualizados.
 * @throws {Error} Si el pallet o la caja no existen, el pallet no está abierto,
 *         la caja no pertenece a ese pallet, o falla la operación.
 */
async function removeBoxFromPallet(palletId, boxCode) {
  console.log(`➖ Iniciando extracción de caja "${boxCode}" del pallet "${palletId}"...`);

  // 1. Obtener pallet
  const { Item: pallet } = await dynamoDB
    .get({ TableName: PALLETS_TABLE, Key: { codigo: palletId } })
    .promise();

  if (!pallet) throw new Error(`Pallet "${palletId}" no existe.`);
  if (pallet.estado !== 'open') throw new Error(`Pallet "${palletId}" no está abierto.`);

  // 2. Obtener caja y validar que esté asignada a este pallet
  const { Item: box } = await dynamoDB
    .get({ TableName: EGGS_TABLE, Key: { codigo: boxCode } })
    .promise();

  if (!box) throw new Error(`Caja "${boxCode}" no existe.`);
  if (box.palletId !== palletId) {
    throw new Error(`Caja "${boxCode}" no está asignada al pallet "${palletId}".`);
  }

  // 3. Actualizar el pallet: remover la caja y decrementar contador
  const { Attributes: updatedPallet } = await dynamoDB.update({
    TableName: PALLETS_TABLE,
    Key: { codigo: palletId },
    UpdateExpression: [
      "SET cajas = :newList",
      "   , cantidadCajas = cantidadCajas - :dec"
    ].join(" "),
    ConditionExpression: "contains(cajas, :box)",
    ExpressionAttributeValues: {
      ':newList': pallet.cajas.filter(c => c !== boxCode),
      ':dec': 1,
      ':box': boxCode,
    },
    ReturnValues: 'ALL_NEW',
  }).promise();

  // 4. Actualizar la caja: eliminar su atributo palletId
  const { Attributes: updatedBox } = await dynamoDB.update({
    TableName: EGGS_TABLE,
    Key: { codigo: boxCode },
    UpdateExpression: 'REMOVE palletId',
    ReturnValues: 'ALL_NEW',
  }).promise();

  console.log(`✅ Caja "${boxCode}" removida de pallet "${palletId}" y desvinculada correctamente.`);

  return { updatedPallet, updatedBox };
}

module.exports = removeBoxFromPallet;
