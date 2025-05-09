# Lambda Lomos Altas - Technical Specifications

## Database Schema

### Boxes Table

Primary key: `codigo` (String)
Global Secondary Indexes:

- `ubicacion-index`: Partition key: `ubicacion`
- `palletId-index`: Partition key: `palletId`

| Attribute    | Type   | Description                                         |
| ------------ | ------ | --------------------------------------------------- |
| codigo       | String | Primary key - Unique identifier for the box         |
| ubicacion    | String | Current location (PACKING, BODEGA, VENTA, TRANSITO) |
| calibre      | String | Egg size/caliber (e.g., "A", "B", "C")              |
| fecha        | String | Production date (ISO format)                        |
| timestamp    | String | Registration timestamp (ISO format)                 |
| palletId     | String | ID of the pallet the box is assigned to             |
| estado       | String | Current state of the box                            |
| customInfo   | Object | Custom information about the box                    |
| scannedCodes | String | JSON string of related scanned codes                |
| updatedAt    | String | Last update timestamp (ISO format)                  |

### Pallets Table

Primary key: `codigo` (String)
Global Secondary Indexes:

- `ubicacion-estado-index`: Partition key: `ubicacion`, Sort key: `estado`
- `estado-index`: Partition key: `estado`

| Attribute     | Type   | Description                                    |
| ------------- | ------ | ---------------------------------------------- |
| codigo        | String | Primary key - Unique identifier for the pallet |
| ubicacion     | String | Current location (BODEGA, VENTA, TRANSITO)     |
| estado        | String | Status (open, closed)                          |
| cajas         | Array  | Array of box codes contained in the pallet     |
| cantidadCajas | Number | Count of boxes in the pallet                   |
| fechaCreacion | String | Creation date (ISO format)                     |
| fechaCierre   | String | Closure date, if closed (ISO format)           |
| calibre       | String | Caliber of eggs in this pallet                 |

### MovementHistory Table

Primary key: `id` (String - UUID)
Global Secondary Indexes:

- `codigo-timestamp-index`: Partition key: `codigo`, Sort key: `timestamp`
- `timestamp-index`: Partition key: `timestamp`

| Attribute    | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| id           | String | Primary key - Unique identifier (UUID) |
| codigo       | String | Box or pallet code                     |
| itemType     | String | Type (BOX or PALLET)                   |
| fromLocation | String | Previous location                      |
| toLocation   | String | New location                           |
| timestamp    | String | Movement timestamp (ISO format)        |
| userId       | String | User who performed the action          |
| metadata     | Object | Additional movement metadata           |

### Issues Table

Primary key: `id` (String - UUID)
Global Secondary Indexes:

- `status-index`: Partition key: `status`
- `timestamp-index`: Partition key: `timestamp`

| Attribute           | Type   | Description                                     |
| ------------------- | ------ | ----------------------------------------------- |
| id                  | String | Primary key - Unique identifier (UUID)          |
| descripcion         | String | Issue description                               |
| status              | String | Issue status (PENDIENTE, RESUELTA, EN_PROGRESO) |
| timestamp           | String | Creation timestamp (ISO format)                 |
| resolutionTimestamp | String | Resolution timestamp, if resolved               |
| resolution          | String | Resolution description                          |

### SystemConfig Table

Primary key: `key` (String)

| Attribute | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| key       | String | Primary key - Configuration key    |
| value     | String | Configuration value                |
| updatedAt | String | Last update timestamp (ISO format) |

### AdminLogs Table

Primary key: `id` (String - UUID)

| Attribute | Type   | Description                            |
| --------- | ------ | -------------------------------------- |
| id        | String | Primary key - Unique identifier (UUID) |
| action    | String | Administrative action performed        |
| timestamp | String | Action timestamp (ISO format)          |
| userId    | String | User who performed the action          |
| details   | Object | Additional action details              |

## Code Patterns

### Route Handler Pattern

```javascript
const createHandler = (handlerFn, options = {}) => {
  return async event => {
    try {
      return await handlerFn(event, options);
    } catch (error) {
      console.error('❌ Error in route handler:', error);
      return createApiResponse(error.statusCode || 500, error.message);
    }
  };
};
```

All route handlers are wrapped with this pattern to provide consistent error handling.

### API Response Pattern

```javascript
// utils/response.js
const createApiResponse = (statusCode, message, data = null) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      status: statusCode < 400 ? 'success' : 'error',
      message,
      data,
    }),
  };
};
```

All API responses follow this consistent format.

### Request Validation Pattern

```javascript
const helpers = {
  parseBody: event => {
    if (!event.body) return {};
    try {
      return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch {
      throw new Error('Invalid request body: unable to parse JSON');
    }
  },
  validateRequired: (data, requiredParams) => {
    const missing = requiredParams.filter(param => !data[param]);
    if (missing.length > 0) {
      throw new Error(`Missing parameters: ${missing.join(', ')}`);
    }
  },
  validateLocation: (location, allowed) => {
    if (!allowed.includes(location)) {
      throw new Error(`Invalid location: ${location}. Valid options: ${allowed.join(', ')}`);
    }
  },
};
```

Input validation follows consistent patterns across all handlers.

## Lambda Handler Structure

The main Lambda handler in `index.js` uses a router pattern to dispatch requests:

```javascript
exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    // Extract HTTP method and path
    const method = event.httpMethod || event.requestContext?.http?.method;
    const path = event.path || event.rawPath;

    // Determine if the request is a GET or POST
    if (method === 'GET') {
      // Find the appropriate GET route handler
      const handler = getRoutes[path];
      if (handler) {
        return await handler(event);
      }
    } else if (method === 'POST') {
      // Find the appropriate POST route handler
      const handler = postRoutes[path];
      if (handler) {
        return await handler(event);
      }
    } else if (method === 'OPTIONS') {
      // Handle CORS preflight requests
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST',
        },
        body: '',
      };
    }

    // If no route handler was found
    return createApiResponse(404, `No handler found for ${method} ${path}`);
  } catch (error) {
    console.error('Unhandled error:', error);
    return createApiResponse(500, 'Internal server error');
  }
};
```

## Data Flow Patterns

### Box Registration Flow

```
Client → API Gateway → Lambda → registerEggHandler
  → parseBoxCode → createBox → findMatchingPallet → addBoxToPallet → response
```

### Box Movement Flow

```
Client → API Gateway → Lambda → movePallet/moveBox
  → getItem → validateLocation → updateItem → recordMovement → response
```

## Anti-Bounce Implementation

The Lambda function implements memory-based anti-bounce protection:

```javascript
/* ---------- memoria anti-rebote ---------- */
const recentlyProcessedBoxes = new Map();
const PROCESSING_COOLDOWN = 2_000; // 2 s

setInterval(() => {
  const now = Date.now();
  for (const [c, t] of recentlyProcessedBoxes)
    if (now - t > 10_000) recentlyProcessedBoxes.delete(c);
}, 60_000);
```

This prevents duplicate processing of the same box within a short time window.

## Environment and Stage Management

```javascript
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
```

Table names are constructed based on the determined stage:

```javascript
const stage = determineStage();
const suffix = stage === 'dev' ? '-dev' : '';

const Tables = {
  Boxes: `Boxes${suffix}`,
  Pallets: `Pallets${suffix}`,
  Issues: `Issues${suffix}`,
  AdminLogs: `AdminLogs${suffix}`,
  SystemConfig: `SystemConfig${suffix}`,
  MovementHistory: `MovementHistory${suffix}`,
};
```

## Code Parsing Utilities

### Box Code Parsing

```javascript
// Box code format: 15-digit numeric string
// Example: 123451234512345
// Where:
// - Position 0: Day of week (dia_semana)
// - Positions 1-2: Week number (semana)
// - Positions 3-4: Year, last two digits (año prefixed with "20")
// - Positions 5-6: Operator ID (operario)
// - Position 7: Packing machine ID (empacadora)
// - Position 8: Process schedule (1 = Morning, other = Afternoon)
// - Positions 9-10: Egg caliber code (calibre)
// - Position 11: Box format code (formato_caja)
// - Positions 12-14: Sequence counter (contador)

function parseBoxCode(code) {
  // Validate format
  if (!code || typeof code !== 'string') {
    throw new Error(`Código inválido: formato incorrecto`);
  }

  if (code.length !== 15) {
    throw new Error(`Código inválido: ${code} (longitud incorrecta, debe tener 15 dígitos)`);
  }

  // Validate that the code contains only digits
  if (!/^\d+$/.test(code)) {
    throw new Error(`Código inválido: ${code} (debe contener solo dígitos)`);
  }

  return {
    dia_semana: code.slice(0, 1),
    semana: code.slice(1, 3),
    año: `20${code.slice(3, 5)}`,
    operario: code.slice(5, 7),
    empacadora: code.slice(7, 8),
    horario_proceso: code.slice(8, 9) === '1' ? 'Mañana' : 'Tarde',
    calibre: code.slice(9, 11),
    formato_caja: code.slice(11, 12),
    contador: code.slice(12, 15),
  };
}
```

### Pallet Code Parsing

```javascript
// Pallet code format: 12-digit numeric string
// Example: 123451234123
// Where:
// - Position 0: Day of week (dia_semana)
// - Positions 1-2: Week number (semana)
// - Positions 3-4: Year, last two digits (año prefixed with "20")
// - Position 5: Process schedule (1 = Morning, other = Afternoon)
// - Positions 6-7: Egg caliber code (calibre)
// - Position 8: Box format code (formato_caja)
// - Positions 9-11: Sequence counter (contador)

function parsePalletCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error(`Código de pallet inválido: formato incorrecto`);
  }

  if (code.length !== 12) {
    console.log(code.length);
    throw new Error(
      `Código de pallet inválido: ${code} (longitud incorrecta, debe tener 12 dígitos)`
    );
  }

  // Validar que el código contiene solo dígitos
  if (!/^\d+$/.test(code)) {
    throw new Error(`Código de pallet inválido: ${code} (debe contener solo dígitos)`);
  }

  return {
    dia_semana: code.slice(0, 1),
    semana: code.slice(1, 3),
    año: `20${code.slice(3, 5)}`,
    horario_proceso: code.slice(5, 6) === '1' ? 'Mañana' : 'Tarde',
    calibre: code.slice(6, 8),
    formato_caja: code.slice(8, 9),
    contador: code.slice(9, 12),
  };
}
```

## Transaction Patterns

The system uses DynamoDB transactions for operations that need to maintain data consistency:

```javascript
async function addBoxToPallet(palletCode, boxCode) {
  try {
    // Verify that both pallet and box exist
    const [pallet, box] = await Promise.all([getPalletByCode(palletCode), getBoxByCode(boxCode)]);

    if (!pallet) {
      throw new Error(`Pallet with code ${palletCode} not found`);
    }

    if (!box) {
      throw new Error(`Box with code ${boxCode} not found`);
    }

    // Check if box is already in a pallet
    if (box.palletId && box.palletId !== 'UNASSIGNED' && box.palletId !== palletCode) {
      throw new Error(`Box ${boxCode} is already assigned to pallet ${box.palletId}`);
    }

    // Use transaction to ensure consistency
    const transactParams = {
      TransactItems: [
        // Update the box with the palletId
        {
          Update: {
            TableName: Tables.Boxes,
            Key: { codigo: boxCode },
            UpdateExpression: 'SET palletId = :palletId, updatedAt = :timestamp',
            ExpressionAttributeValues: {
              ':palletId': palletCode,
              ':timestamp': new Date().toISOString(),
            },
          },
        },
        // Update the pallet with the new box
        {
          Update: {
            TableName: Tables.Pallets,
            Key: { codigo: palletCode },
            UpdateExpression: 'ADD cajas :box, cantidadCajas :uno',
            ExpressionAttributeValues: {
              ':box': dynamoDB.createSet([boxCode]),
              ':uno': 1,
            },
          },
        },
      ],
    };

    await dynamoDB.transactWrite(transactParams).promise();

    // Get the updated pallet
    const updatedPallet = await getPalletByCode(palletCode);
    return updatedPallet;
  } catch (error) {
    throw handleDynamoDBError(
      error,
      'add box to pallet',
      'transaction',
      `${boxCode} -> ${palletCode}`
    );
  }
}
```

## Error Handling Pattern

The system uses a consistent error handling pattern:

```javascript
function handleDynamoDBError(error, action, itemType, itemId) {
  // Log the original error
  console.error(`Error al ${action} ${itemType} ${itemId || ''}:`, error);

  // Check for conditional check failures (often used for optimistic locking)
  if (error.code === 'ConditionalCheckFailedException') {
    return new Error(`El ${itemType} ha sido modificado por otro usuario. Intente de nuevo.`);
  }

  // Check for provisioned throughput exceeded
  if (error.code === 'ProvisionedThroughputExceededException') {
    return new Error(`Demasiadas peticiones. Intente de nuevo en unos segundos.`);
  }

  // Check for validation errors
  if (error.code === 'ValidationException') {
    return new Error(`Error de validación: ${error.message}`);
  }

  // Return a generic error message
  return new Error(`Error al ${action} ${itemType}: ${error.message}`);
}
```

## Report Generation Pattern

The system uses ExcelJS for generating reports:

```javascript
async function generateExcelReport(data, reportType) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte');

  // Set up columns based on report type
  if (reportType === 'inventory') {
    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 20 },
      { header: 'Ubicación', key: 'ubicacion', width: 15 },
      { header: 'Calibre', key: 'calibre', width: 10 },
      { header: 'Fecha Producción', key: 'fecha', width: 15 },
      { header: 'Pallet', key: 'palletId', width: 20 },
    ];
  } else if (reportType === 'movements') {
    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 20 },
      { header: 'Tipo', key: 'itemType', width: 10 },
      { header: 'Origen', key: 'fromLocation', width: 15 },
      { header: 'Destino', key: 'toLocation', width: 15 },
      { header: 'Fecha/Hora', key: 'timestamp', width: 20 },
      { header: 'Usuario', key: 'userId', width: 15 },
    ];
  }

  // Add data rows
  worksheet.addRows(data);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
```

## Scheduled Jobs

The Lambda function includes self-cleaning tasks using setInterval:

```javascript
// Clean up the anti-bounce cache every minute
setInterval(() => {
  const now = Date.now();
  for (const [c, t] of recentlyProcessedBoxes)
    if (now - t > 10_000) recentlyProcessedBoxes.delete(c);
}, 60_000);
```

## Configuration Management Pattern

```javascript
async function getSystemConfig(key) {
  try {
    const params = {
      TableName: Tables.SystemConfig,
      Key: { key },
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item ? result.Item.value : null;
  } catch (error) {
    console.error(`Error getting system config ${key}:`, error);
    return null;
  }
}

async function setSystemConfig(key, value) {
  try {
    const params = {
      TableName: Tables.SystemConfig,
      Item: {
        key,
        value,
        updatedAt: new Date().toISOString(),
      },
    };

    await dynamoDB.put(params).promise();
    return true;
  } catch (error) {
    console.error(`Error setting system config ${key}:`, error);
    return false;
  }
}
```

## Performance Considerations

1. **GSI Usage**: The system uses Global Secondary Indexes for querying data by locations, pallets, and timestamps.
2. **In-Memory Cache**: Anti-bounce protection uses in-memory caching to prevent duplicate processing.
3. **Batch Operations**: Where possible, the system uses batch operations for improved performance.

## Security Considerations

1. **Input Validation**: All inputs are validated before processing.
2. **Parameter Validation**: Required parameters are checked for existence.
3. **Location Validation**: Location values are validated against allowed values.
4. **CORS Headers**: The API includes CORS headers to allow cross-domain access.

## Deployment Configuration

The project includes a buildspec.yml file for AWS CodeBuild:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 16
    commands:
      - npm install
  build:
    commands:
      - echo Build started on `date`
      - npm run format:check
  post_build:
    commands:
      - echo Build completed on `date`

artifacts:
  files:
    - index.js
    - package.json
    - package-lock.json
    - handlers/**/*
    - models/**/*
    - utils/**/*
    - node_modules/**/*
  discard-paths: no

cache:
  paths:
    - node_modules/**/*
```

This configuration defines the build process for the Lambda function.

## AWS Service Dependencies

1. **AWS Lambda**: The main compute service that hosts the function
2. **Amazon DynamoDB**: NoSQL database for storing all data
3. **AWS API Gateway**: Exposes the Lambda function as a RESTful API
4. **AWS CloudWatch**: Used for logging and monitoring
5. **AWS CodeBuild**: Used for building and deploying the Lambda function
