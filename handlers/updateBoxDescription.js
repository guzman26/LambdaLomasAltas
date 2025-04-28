const AWS = require("aws-sdk");
const createApiResponse = require("../../utils/response");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const updateBoxDescription = async (codigo, newDescription) => {
  if (!codigo || typeof codigo !== "string") {
    return createApiResponse(400, "❌ Invalid box code.");
  }

  if (typeof newDescription !== "string" || newDescription.trim().length === 0) {
    return createApiResponse(400, "❌ Description must be a non-empty string.");
  }

  try {
    const params = {
      TableName: "Boxes",
      Key: { codigo },
      UpdateExpression: "SET descripcion = :desc",
      ExpressionAttributeValues: {
        ":desc": newDescription.trim()
      },
      ReturnValues: "ALL_NEW"
    };

    const result = await dynamoDB.update(params).promise();

    return createApiResponse(200, "✅ Description updated successfully", result.Attributes);
  } catch (error) {
    console.error("❌ Error updating description:", error);
    return createApiResponse(500, "❌ Failed to update box description", { error: error.message });
  }
};

module.exports = updateBoxDescription;
