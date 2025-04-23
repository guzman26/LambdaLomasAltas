const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const EGGS_TABLE = "Huevos";

/**
 * Función que obtiene los detalles de una caja, dado su código.
 * Espera un POST con JSON: { "codigo": "123456789012345" }
 */
async function getBoxByCode(codigo) {
  try {
    

    if (!codigo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "⚠️ El campo 'codigo' es obligatorio." }),
      };
    }

    const params = {
      TableName: EGGS_TABLE,
      Key: { codigo },
    };

    const { Item: box } = await dynamoDB.get(params).promise();

    if (!box) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `❌ Caja con código "${codigo}" no encontrada.` }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Caja encontrada",
        data: box,
      }),
    };
  } catch (error) {
    console.error("❌ Error al buscar la caja:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "❌ Error interno al buscar la caja.",
        error: error.message,
      }),
    };
  }
}

module.exports = getBoxByCode;
