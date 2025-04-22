import AWS from "aws-sdk";
import createApiResponse from "../utils/response";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Boxes';

/**
 * Lambda handler to get full details of multiple boxes
 * @param {Object} event - Lambda event
 * @returns {Object} API response
 */
const getBoxesInPallet = async (event: any) => {
  try {
    const body = JSON.parse(event.body);
    const { codigos } = body;
    console.log('🔎 Searching for boxes:', codigos)


    if (!Array.isArray(codigos) || codigos.length === 0) {
      return createApiResponse(400, "Debe proporcionar una lista de códigos en 'codigos'.");
    }

    // DynamoDB allows max 100 keys per batch request
    const batches = [];
    for (let i = 0; i < codigos.length; i += 100) {
      const batch = codigos.slice(i, i + 100).map(codigo => ({ codigo }));
      batches.push(batch);
    }

    const allResults = [];

    for (const batch of batches) {
      const params = {
        RequestItems: {
          [TABLE_NAME]: {
            Keys: batch
          }
        }
      };

      const result = await dynamoDB.batchGet(params).promise();
      console.log('🔍 DynamoDB result:', JSON.stringify(result, null, 2));
      const foundItems = result.Responses?.[TABLE_NAME] || [];
      allResults.push(...foundItems);
    }

    return createApiResponse(200, `✅ Se encontraron ${allResults.length} cajas`, allResults);
  } catch (error: any) {
    console.error('❌ Error fetching box details:', error);
    return createApiResponse(500, 'Error interno al obtener detalles de las cajas', { error: error.message });
  }
};

module.exports = getBoxesInPallet;
