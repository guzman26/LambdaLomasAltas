import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import { ApiResponse, Issue } from '../../types';
import createApiResponse from "../../utils/response";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ISSUES_TABLE = "Issues"; // Asegúrate de crear esta tabla en DynamoDB

interface IssueCreate {
  IssueNumber: string;
  descripcion: string;
  timestamp: string;
  estado: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
}

const createIssue = async (descripcion: string): Promise<ApiResponse> => {
  try {
    if (!descripcion || descripcion.trim() === "") {
      return createApiResponse(400, "⚠️ La descripción es obligatoria.");
    }

    const issue: IssueCreate = {
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

    return createApiResponse(200, "✅ Reporte Enviado", issue);
  } catch (error) {
    console.error("❌ Error al reportar issue:", error);
    return createApiResponse(500, "❌ Error al reportar issue:", (error as Error).message);
  }
};

export default createIssue; 