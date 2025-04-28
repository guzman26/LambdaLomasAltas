const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const createApiResponse = require('../utils/response');

const ISSUES_TABLE = "Issues"; // Asegúrate de crear esta tabla en DynamoDB

const postIssue = async (descripcion) => {
  try {

    if (!descripcion || descripcion.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "⚠️ La descripción es obligatoria." }),
      };
    }

    const issue = {
      IssueNumber: uuidv4(),
      descripcion,
      timestamp: new Date().toISOString(),
      estado: "PENDING",
    };

    const params = {
      TableName: ISSUES_TABLE,
      Item: issue,
    };

    await dynamoDB.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Reporte Enviado",
        data: issue,
      })
    }
  } catch (error) {
    console.error("❌ Error al reportar issue:", error);
    return createApiResponse(500, "❌ Error al reportar issue:");
  }
};

module.exports = postIssue ;