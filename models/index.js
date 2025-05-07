const AWS = require('aws-sdk');

// Intentar cargar variables de entorno desde .env si existe
try {
  // Solo intentar importar dotenv si no estamos en Lambda
  const isLambda = !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);

  if (!isLambda) {
    // Solo cargar dotenv en entorno local
    // eslint-disable-next-line global-require
    require('dotenv').config();
    console.log('Variables de entorno cargadas desde .env');
  }
} catch (error) {
  // Es normal que falle si dotenv no está instalado o no existe .env
  // No interrumpimos la ejecución
}

// Shared DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Prioridad en la detección del entorno:
// 1. Variable de entorno STAGE explícitamente configurada
// 2. Variable NODE_ENV=production indica entorno principal
// 3. Detectar si estamos en entorno de CI/CD por la presencia de variables de GitHub Actions
// 4. Valor predeterminado: 'dev'
function determineStage() {
  // 1. Si STAGE está explícitamente configurado, usamos ese valor
  if (process.env.STAGE) {
    return process.env.STAGE;
  }

  // 2. Si NODE_ENV es production, asumimos entorno principal
  if (process.env.NODE_ENV === 'production') {
    return 'main';
  }

  // 3. Detectar entorno de GitHub Actions
  if (process.env.GITHUB_ACTIONS) {
    // Si estamos en la rama main o master
    const branch = process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF;
    if (branch === 'main' || branch === 'master') {
      return 'main';
    }
    if (branch === 'dev') {
      return 'dev';
    }
  }

  // 4. Valor predeterminado para desarrollo local
  return 'dev';
}

// Determinar el stage actual
const stage = determineStage();
const suffix = stage === 'dev' ? '-dev' : '';

// Para depuración, registrar el entorno actual
// Solo en desarrollo o en despliegue inicial
if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
  console.log(`[CONFIG] Entorno detectado: ${stage} (suffix: '${suffix}')`);
  console.log(
    `[CONFIG] Variables de entorno: NODE_ENV=${process.env.NODE_ENV}, STAGE=${process.env.STAGE}`
  );
}

// Table name mappings
const Tables = {
  Boxes: `Boxes${suffix}`,
  Pallets: `Pallets${suffix}`,
  Issues: `Issues${suffix}`,
  AdminLogs: `AdminLogs${suffix}`,
  SystemConfig: `SystemConfig${suffix}`,
  MovementHistory: `MovementHistory${suffix}`,
};

module.exports = {
  dynamoDB,
  Tables,
  currentStage: stage,
};
