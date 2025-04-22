import AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { DynamoDbItem } from "../types";

const EGGS_TABLE = "Huevos";
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Obtiene las cajas con ubicación "PACKING" y sin pallet asignado.
 * Usa un GSI en `ubicacion` para hacer un query eficiente.
 * 
 * @returns {Promise<Array>} Lista de cajas sin pallet
 */
const getUnassignedBoxesInPacking = async (): Promise<DynamoDbItem[]> => {
  const params: DocumentClient.QueryInput = {
    TableName: EGGS_TABLE,
    IndexName: "ubicacion-index", // Asegúrate que este GSI existe
    KeyConditionExpression: "ubicacion = :packing",
    FilterExpression: "attribute_not_exists(palletId)",
    ExpressionAttributeValues: {
      ":packing": "PACKING",
    },
  };

  const results: DynamoDbItem[] = [];
  let lastKey: DocumentClient.Key | undefined = undefined;

  do {
    const data: DocumentClient.QueryOutput = await dynamoDB.query({
      ...params,
      ExclusiveStartKey: lastKey,
    }).promise();

    if (data.Items) {
      results.push(...data.Items as DynamoDbItem[]);
    }
    lastKey = data.LastEvaluatedKey;
  } while (lastKey);

  return results;
};

export default getUnassignedBoxesInPacking;
