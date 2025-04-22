import AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { DynamoDbItem } from "../types";

const EGGS_TABLE = "Huevos";
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Returns all boxes that have not yet been assigned to a pallet.
 * Assumes each box has a `palletId` attribute set to "UNASSIGNED" when unassigned.
 */
async function findBoxesWithoutPallet(): Promise<DynamoDbItem[]> {
  const params: DocumentClient.QueryInput = {
    TableName: EGGS_TABLE,
    IndexName: "palletId-index",
    KeyConditionExpression: "palletId = :unassigned",
    ExpressionAttributeValues: {
      ":unassigned": "UNASSIGNED"
    }
  };

  try {
    const results: DynamoDbItem[] = [];
    let lastEvaluatedKey: DocumentClient.Key | undefined = undefined;

    do {
      const data: DocumentClient.QueryOutput = await dynamoDB.query({
        ...params,
        ExclusiveStartKey: lastEvaluatedKey || undefined
      }).promise();

      if (data.Items) {
        results.push(...data.Items as DynamoDbItem[]);
      }
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);


    console.log(`📦 Found ${results.length} unassigned boxes`);
    return results;
  } catch (error) {
    console.error("❌ Error finding unassigned boxes:", error);
    throw new Error("Failed to retrieve unassigned boxes.");
  }
}

export default findBoxesWithoutPallet;