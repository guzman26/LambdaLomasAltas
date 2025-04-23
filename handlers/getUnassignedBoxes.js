const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const EGGS_TABLE = "Boxes";

/**
 * Returns all boxes that have not yet been assigned to a pallet.
 * Assumes each box has a `palletId` attribute set to "UNASSIGNED" when unassigned.
 */
async function findBoxesWithoutPallet() {
  const params = {
    TableName: EGGS_TABLE,
    IndexName: "palletId-index",
    KeyConditionExpression: "palletId = :unassigned",
    ExpressionAttributeValues: {
      ":unassigned": "UNASSIGNED"
    }
  };

  try {
    const results = [];
    let lastEvaluatedKey = null;

    do {
      const data = await dynamoDB.query({
        ...params,
        ExclusiveStartKey: lastEvaluatedKey
      }).promise();

      results.push(...data.Items);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);


    console.log(`📦 Found ${results.length} unassigned boxes`);
    return results;
  } catch (error) {
    console.error("❌ Error finding unassigned boxes:", error);
    throw new Error("Failed to retrieve unassigned boxes.");
  }
}

module.exports = findBoxesWithoutPallet;