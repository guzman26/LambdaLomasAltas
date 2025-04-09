const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const EGGS_TABLE = "Huevos";

/**
 * Obtiene las cajas con ubicación "PACKING" y sin pallet asignado.
 * Usa un GSI en `ubicacion` para hacer un query eficiente.
 * 
 * @returns {Promise<Array>} Lista de cajas sin pallet
 */
const getUnassignedBoxesInPacking = async () => {
  const params = {
    TableName: EGGS_TABLE,
    IndexName: "ubicacion-index", // Asegúrate que este GSI existe
    KeyConditionExpression: "ubicacion = :packing",
    FilterExpression: "attribute_not_exists(palletId)",
    ExpressionAttributeValues: {
      ":packing": "PACKING",
    },
  };

  const results = [];
  let lastKey = null;

  do {
    const data = await dynamoDB.query({
      ...params,
      ExclusiveStartKey: lastKey,
    }).promise();

    results.push(...data.Items);
    lastKey = data.LastEvaluatedKey;
  } while (lastKey);

  return results;
};

module.exports = getUnassignedBoxesInPacking;
