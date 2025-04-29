const AWS = require('aws-sdk');
const { Tables } = require('../models');

// Crear un cliente de DynamoDB para crear tablas
const dynamoDB = new AWS.DynamoDB({
  region: "us-east-2",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:4566",
  credentials: {
    accessKeyId: process.env.LOCAL_DEVELOPMENT ? "test" : undefined,
    secretAccessKey: process.env.LOCAL_DEVELOPMENT ? "test" : undefined
  }
});

const tableDefinitions = [
  {
    TableName: Tables.Boxes,
    KeySchema: [
      { AttributeName: "codigo", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "codigo", AttributeType: "S" },
      { AttributeName: "ubicacion", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "ubicacion-index",
        KeySchema: [
          { AttributeName: "ubicacion", KeyType: "HASH" }
        ],
        Projection: {
          ProjectionType: "ALL"
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  },
  {
    TableName: Tables.Pallets,
    KeySchema: [
      { AttributeName: "codigo", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "codigo", AttributeType: "S" },
      { AttributeName: "estado", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "estado-index",
        KeySchema: [
          { AttributeName: "estado", KeyType: "HASH" }
        ],
        Projection: {
          ProjectionType: "ALL"
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  },
  {
    TableName: Tables.Issues,
    KeySchema: [
      { AttributeName: "IssueNumber", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "IssueNumber", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  },
  {
    TableName: Tables.AdminLogs,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "timestamp", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "timestamp-index",
        KeySchema: [
          { AttributeName: "timestamp", KeyType: "HASH" }
        ],
        Projection: {
          ProjectionType: "ALL"
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  },
  {
    TableName: Tables.SystemConfig,
    KeySchema: [
      { AttributeName: "key", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "key", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST"
  }
];

// Función para crear una tabla
async function createTable(tableDefinition) {
  try {
    const result = await dynamoDB.createTable(tableDefinition).promise();
    console.log(`✅ Tabla ${tableDefinition.TableName} creada exitosamente.`);
    return result;
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log(`⚠️ La tabla ${tableDefinition.TableName} ya existe.`);
    } else {
      console.error(`❌ Error al crear la tabla ${tableDefinition.TableName}:`, error);
    }
    return null;
  }
}

// Función principal para crear todas las tablas
async function createAllTables() {
  console.log(`🚀 Creando tablas con sufijo: ${process.env.STAGE === 'dev' ? '-dev' : ''}`);
  
  for (const tableDefinition of tableDefinitions) {
    await createTable(tableDefinition);
  }
  
  console.log('✅ Proceso de creación de tablas completado.');
}

// Ejecutar la función
createAllTables().catch(error => {
  console.error('❌ Error en el proceso de creación de tablas:', error);
  process.exit(1);
}); 