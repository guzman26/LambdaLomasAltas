// 1) Importas el cliente de DynamoDB de AWS SDK v3
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

// 2) Configuración según entorno
const isLocal = process.env.IS_LOCAL || process.env.NODE_ENV === 'dev' && process.env.AWS_LAMBDA_FUNCTION_NAME === undefined;

// Configuración para cliente de DynamoDB
const clientConfig = {
  region: "us-east-2"
};

// Solo añade endpoint personalizado y credenciales si estamos en un entorno local
if (isLocal) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT || "http://localhost:4566";
  clientConfig.credentials = {
    accessKeyId: "test",
    secretAccessKey: "test"
  };
}

const client = new DynamoDBClient(clientConfig);

// Obtener el nombre de la tabla según el entorno
const getTableName = () => {
  const stage = process.env.NODE_ENV || 'dev';
  return `Huevos-${stage}`;
};

// 3) Este es tu "lambda handler" exportado
export const lambdaHandler = async (event) => {
  try {
    // parseas el body JSON de la petición
    const body = JSON.parse(event.body || "{}");

    // insertas un ítem en tu tabla "Huevos"
    await client.send(new PutItemCommand({
      TableName: getTableName(),
      Item: {
        id:   { S: body.id   || "default-id" },
        info: { S: body.info || "sin-info" }
      }
    }));

    // devuelves un 200 OK con un mensaje
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        message: `Registro exitoso (${isLocal ? 'local' : 'producción'})`,
        id: body.id || "default-id"
      })
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        message: "Error al procesar la solicitud", 
        error: error.message
      })
    };
  }
};
