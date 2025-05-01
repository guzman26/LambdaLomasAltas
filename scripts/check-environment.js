#!/usr/bin/env node

/**
 * Script para verificar el entorno de ejecución actual
 * y mostrar la configuración de las tablas de DynamoDB
 */

// Intentar cargar dotenv primero
try {
  require('dotenv').config();
  console.log('✅ Variables de entorno cargadas desde .env');
} catch (error) {
  console.log('⚠️ No se pudo cargar dotenv, continuando sin archivo .env');
}

const { Tables, currentStage } = require('../models');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Mostrar información del entorno
console.log(`\n${colors.magenta}==============================================${colors.reset}`);
console.log(`${colors.magenta}     VERIFICACIÓN DE ENTORNO LAMBDA LOMAS ALTAS     ${colors.reset}`);
console.log(`${colors.magenta}==============================================${colors.reset}\n`);

// Información sobre el entorno
console.log(
  `${colors.cyan}Entorno detectado:${colors.reset} ${currentStage === 'dev' ? colors.yellow + currentStage : colors.green + currentStage}${colors.reset}`
);
console.log(`${colors.cyan}NODE_ENV:${colors.reset} ${process.env.NODE_ENV || 'no definido'}`);
console.log(`${colors.cyan}STAGE:${colors.reset} ${process.env.STAGE || 'no definido'}`);
console.log(
  `${colors.cyan}Sufijo de tabla:${colors.reset} ${currentStage === 'dev' ? "'-dev'" : 'ninguno'}`
);
console.log(
  `${colors.cyan}Entorno Lambda:${colors.reset} ${process.env.AWS_LAMBDA_FUNCTION_NAME ? 'AWS Lambda' : 'Local'}`
);

// Mostrar tablas configuradas
console.log(`\n${colors.blue}Tablas DynamoDB configuradas:${colors.reset}`);
Object.entries(Tables).forEach(([key, value]) => {
  console.log(`  - ${key}: ${value}`);
});

// Variables de entorno adicionales
console.log(`\n${colors.blue}Variables de entorno adicionales:${colors.reset}`);
const relevantVars = [
  'DEPLOYMENT_BRANCH',
  'DEPLOYMENT_TIMESTAMP',
  'ENV_SOURCE',
  'AWS_REGION',
  'AWS_LAMBDA_FUNCTION_NAME',
];

let foundVars = false;
relevantVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  - ${varName}: ${process.env[varName]}`);
    foundVars = true;
  }
});

if (!foundVars) {
  console.log('  No se encontraron variables de entorno adicionales');
}

// Verificación de AWS
console.log(`\n${colors.blue}Verificación de AWS:${colors.reset}`);

try {
  const AWS = require('aws-sdk');
  const credentials = AWS.config.credentials;

  if (credentials) {
    console.log(`  ✅ Credenciales AWS disponibles`);
  } else {
    console.log(`  ⚠️ No se encontraron credenciales AWS configuradas`);
  }

  console.log(`  Región configurada: ${AWS.config.region || 'no definida'}`);
} catch (error) {
  console.log(`  ❌ Error al verificar AWS: ${error.message}`);
}

console.log(`\n${colors.magenta}==============================================${colors.reset}\n`);
