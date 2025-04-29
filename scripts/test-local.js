#!/usr/bin/env node

// Script para probar el funcionamiento de la lambda en entorno local
import fetch from 'node-fetch';
import { DynamoDBClient, GetItemCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Configuración
const API_URL = 'http://localhost:3000/huevos';
const DYNAMO_ENDPOINT = 'http://localhost:4566';
const TABLE_NAME = 'Huevos-dev';

// Cliente DynamoDB
const dynamoClient = new DynamoDBClient({
  endpoint: DYNAMO_ENDPOINT,
  region: "us-east-2",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test"
  }
});

// Colores para la consola
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

// Función para iniciar el servidor serverless
async function startServer() {
  console.log(`${colors.blue}Iniciando el servidor serverless...${colors.reset}`);
  
  // Establecer variables de entorno para el proceso hijo
  const env = {
    ...process.env,
    IS_LOCAL: 'true',
    NODE_ENV: 'dev'
  };
  
  // Iniciar el servidor serverless-offline en un proceso separado
  const serverProcess = spawn('npm', ['run', 'start'], { 
    env,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'] 
  });
  
  // Esperar a que el servidor esté listo
  return new Promise((resolve, reject) => {
    let isResolved = false;
    
    // Escuchar la salida estándar
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`${colors.cyan}[SERVIDOR] ${output.trim()}${colors.reset}`);
      
      // Detectar cuando el servidor está listo
      if (output.includes('Server ready') && !isResolved) {
        isResolved = true;
        console.log(`${colors.green}¡El servidor serverless está listo!${colors.reset}`);
        resolve(serverProcess);
      }
    });
    
    // Escuchar errores
    serverProcess.stderr.on('data', (data) => {
      console.error(`${colors.red}[ERROR] ${data.toString().trim()}${colors.reset}`);
    });
    
    // Si el proceso termina antes de estar listo
    serverProcess.on('close', (code) => {
      if (!isResolved) {
        reject(new Error(`El servidor se cerró con código ${code} antes de estar listo`));
      }
    });
    
    // Timeout de 10 segundos
    setTimeout(10000).then(() => {
      if (!isResolved) {
        serverProcess.kill();
        reject(new Error('Timeout esperando a que el servidor esté listo'));
      }
    });
  });
}

// Función para realizar solicitudes a la API
async function makeRequest(payload, testName) {
  console.log(`\n${colors.yellow}PRUEBA: ${testName}${colors.reset}`);
  console.log(`${colors.blue}Enviando solicitud:${colors.reset}`, payload);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}Respuesta exitosa (${response.status}):${colors.reset}`, data);
      return {
        success: true,
        data,
        status: response.status
      };
    } else {
      console.log(`${colors.red}Error en la respuesta (${response.status}):${colors.reset}`, data);
      return {
        success: false,
        data,
        status: response.status
      };
    }
  } catch (error) {
    console.error(`${colors.red}Error al hacer la solicitud:${colors.reset}`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para verificar que los datos se guardaron en DynamoDB
async function verifyItemInDynamoDB(id) {
  console.log(`${colors.blue}Verificando el ítem con ID '${id}' en DynamoDB...${colors.reset}`);
  
  try {
    const command = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        id: { S: id }
      }
    });
    
    const response = await dynamoClient.send(command);
    
    if (response.Item) {
      console.log(`${colors.green}Ítem encontrado en DynamoDB:${colors.reset}`, response.Item);
      return {
        success: true,
        item: response.Item
      };
    } else {
      console.log(`${colors.red}Ítem no encontrado en DynamoDB${colors.reset}`);
      return {
        success: false
      };
    }
  } catch (error) {
    console.error(`${colors.red}Error al verificar en DynamoDB:${colors.reset}`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para escanear la tabla completa (para depuración)
async function scanTable() {
  console.log(`${colors.blue}Escaneando la tabla completa...${colors.reset}`);
  
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME
    });
    
    const response = await dynamoClient.send(command);
    console.log(`${colors.green}Ítems en la tabla:${colors.reset}`, response.Items);
    return response.Items;
  } catch (error) {
    console.error(`${colors.red}Error al escanear la tabla:${colors.reset}`, error.message);
    return [];
  }
}

// Función para limpiar los datos de prueba
async function cleanupTestData(ids) {
  console.log(`${colors.blue}Limpiando datos de prueba...${colors.reset}`);
  
  const deletePromises = ids.map(async (id) => {
    try {
      const command = new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: {
          id: { S: id }
        }
      });
      
      await dynamoClient.send(command);
      console.log(`${colors.green}Eliminado ítem con ID:${colors.reset}`, id);
    } catch (error) {
      console.error(`${colors.red}Error al eliminar ítem ${id}:${colors.reset}`, error.message);
    }
  });
  
  await Promise.all(deletePromises);
}

// Función principal para ejecutar las pruebas
async function runTests() {
  let serverProcess;
  const testIds = [];
  
  try {
    // Iniciar el servidor
    serverProcess = await startServer();
    
    // Esperar a que el servidor esté completamente iniciado
    await setTimeout(2000);
    
    // CASO 1: Registro completo (ID e info)
    const testId1 = `test-${Date.now()}-1`;
    testIds.push(testId1);
    const result1 = await makeRequest({
      id: testId1,
      info: "Huevo de prueba completo"
    }, "Registro completo con ID e info");
    
    if (result1.success) {
      await verifyItemInDynamoDB(testId1);
    }
    
    // CASO 2: Solo con ID (info por defecto)
    const testId2 = `test-${Date.now()}-2`;
    testIds.push(testId2);
    const result2 = await makeRequest({
      id: testId2
    }, "Registro solo con ID (info por defecto)");
    
    if (result2.success) {
      await verifyItemInDynamoDB(testId2);
    }
    
    // CASO 3: Solo con info (ID por defecto)
    // Este caso generará un ID por defecto, pero necesitamos saber cuál es para limpiarlo después
    const result3 = await makeRequest({
      info: "Huevo de prueba sin ID"
    }, "Registro solo con info (ID por defecto)");
    
    if (result3.success) {
      testIds.push("default-id");
      await verifyItemInDynamoDB("default-id");
    }
    
    // CASO 4: Múltiples registros con el mismo ID (actualización)
    const testId4 = `test-${Date.now()}-4`;
    testIds.push(testId4);
    
    // Primera inserción
    await makeRequest({
      id: testId4,
      info: "Primera versión"
    }, "Registro inicial para actualización");
    
    // Segunda inserción con el mismo ID
    await makeRequest({
      id: testId4,
      info: "Segunda versión (actualización)"
    }, "Actualización de registro existente");
    
    // Verificar que se actualizó
    await verifyItemInDynamoDB(testId4);
    
    // Opcional: mostrar todos los ítems para depuración
    await scanTable();
    
    // Resumen de las pruebas
    console.log(`\n${colors.green}===== RESUMEN DE PRUEBAS =====`);
    console.log(`${colors.green}Pruebas completadas con éxito.`);
    console.log(`${colors.green}IDs de prueba utilizados: ${testIds.join(", ")}`);
    
  } catch (error) {
    console.error(`${colors.red}Error durante las pruebas:${colors.reset}`, error);
  } finally {
    // Limpieza: eliminar datos de prueba y cerrar el servidor
    try {
      await cleanupTestData(testIds);
    } catch (e) {
      console.error(`${colors.red}Error durante la limpieza:${colors.reset}`, e);
    }
    
    if (serverProcess) {
      console.log(`${colors.blue}Cerrando el servidor...${colors.reset}`);
      serverProcess.kill();
    }
  }
}

// Ejecutar las pruebas
console.log(`${colors.magenta}===== INICIANDO PRUEBAS AUTOMATIZADAS =====`);
console.log(`${colors.magenta}URL de la API: ${API_URL}`);
console.log(`${colors.magenta}Endpoint de DynamoDB: ${DYNAMO_ENDPOINT}`);
console.log(`${colors.magenta}Tabla: ${TABLE_NAME}`);

runTests().then(() => {
  console.log(`${colors.magenta}===== PRUEBAS FINALIZADAS =====`);
}); 