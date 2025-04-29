// Script para crear la tabla Huevos en LocalStack
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

// Obtener el stage desde las variables de entorno o usar 'dev' por defecto
const stage = process.env.NODE_ENV || 'dev';
const tableName = `Huevos-${stage}`;

const client = new DynamoDBClient({
  endpoint: "http://localhost:4566",
  region: "us-east-2",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test"
  }
});

async function createTable() {
  try {
    const command = new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH"
        }
      ],
      BillingMode: "PAY_PER_REQUEST"
    });

    const response = await client.send(command);
    console.log(`✅ Tabla ${tableName} creada exitosamente:`, response);
  } catch (error) {
    if (error.name === "ResourceInUseException") {
      console.log(`⚠️ La tabla ${tableName} ya existe, no es necesario crearla.`);
    } else {
      console.error(`❌ Error al crear la tabla ${tableName}:`, error);
    }
  }
}

createTable(); 