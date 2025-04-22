# Huevos Lambda APIs

Backend APIs for managing egg production, packaging and distribution.

## Project Structure

The project has been organized according to a CRUD-based structure for each entity:

```
/
├── models/                  # Data models
│   ├── Box.js              # Box model
│   ├── Egg.js              # Egg model
│   ├── Issue.js            # Issue model
│   ├── Pallet.js           # Pallet model
│   └── SystemConfig.js     # System configuration model
│
├── controllers/             # CRUD controllers for each entity
│   ├── eggs/
│   │   ├── create.js       # Create operations
│   │   ├── read.js         # Read operations
│   │   ├── update.js       # Update operations
│   │   ├── delete.js       # Delete operations
│   │   └── index.js        # Exports all operations
│   │
│   ├── boxes/              # Box operations
│   ├── pallets/            # Pallet operations
│   ├── issues/             # Issue operations
│   ├── admin/              # Admin operations
│   │   ├── dashboard.js    # Dashboard data
│   │   ├── issues.js       # Issue management
│   │   ├── system.js       # System operations
│   │   └── index.js
│   │
│   └── reports/            # Report generation
│
├── utils/                   # Utility functions
│   ├── db.js               # Database utilities
│   └── response.js         # API response formatter
│
├── index.js                 # Main application entry point
├── package.json
└── README.md
```

## Database Tables

- **Huevos**: Stores egg and box information
- **Pallets**: Stores pallet information
- **Issues**: Stores reported issues
- **SystemConfig**: Stores system configuration
- **AdminLogs**: Stores admin operation logs

## API Routes

### Egg Management

- `GET /production`: Get all eggs
- `GET /getBodegaEggs`: Get eggs in storage
- `GET /getPackingData`: Get eggs in packing
- `GET /getVentaData`: Get eggs for sale
- `GET /getEggsByDate`: Get eggs by date
- `GET /getEggsByCodigo`: Get egg by code

### Box Management

- `GET /getBoxByCode`: Get a box by its code
- `GET /getUnassignedBoxesInPacking`: Get unassigned boxes in packing
- `POST /updateBoxDescription`: Update box description

### Pallet Management

- `GET /getPallets`: Get all pallets
- `GET /getActivePallets`: Get active pallets
- `GET /getClosedPallets`: Get closed pallets
- `GET /getBoxesInPallet`: Get boxes in a pallet
- `POST /AssignPallet`: Assign a pallet
- `POST /AssignBoxToPallet`: Assign a box to a pallet
- `POST /createPallet`: Create a new pallet
- `POST /closePallet`: Close a pallet
- `POST /movePallet`: Move a pallet

### Scanner Processing

- `POST /procesar-escaneo`: Process a scan operation

### Issue Management

- `POST /postIssue`: Create a new issue
- `POST /admin/updateIssueStatus`: Update an issue status
- `POST /admin/deleteIssue`: Delete an issue

### Admin Operations

- `GET /admin/dashboard`: Get system dashboard
- `GET /admin/issues`: Get issues with filtering
- `POST /admin/auditAndFix`: Audit and fix data issues
- `POST /admin/backup`: Create a data backup
- `POST /admin/generateReport`: Generate a report
- `POST /admin/generateExcelReport`: Generate an Excel report
- `POST /admin/generateCustomReport`: Generate a custom report
- `POST /admin/deleteBox`: Delete a box
- `POST /admin/deletePallet`: Delete a pallet

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Test locally:
   ```
   npm run test
   ```

3. Deploy:
   ```
   npm run deploy
   ```

## TypeScript Enhancements

Se han completado las siguientes mejoras adicionales al proyecto con TypeScript:

1. **Todos los modelos convertidos a TypeScript:**
   - Box.ts
   - Pallet.ts
   - Issue.ts
   - SystemConfig.ts

2. **Todos los controladores convertidos a TypeScript:**
   - controllers/pallets
   - controllers/boxes
   - controllers/admin
   - controllers/issues
   - controllers/reports

3. **Pruebas mejoradas:**
   - Prueba multiple endpoints con un solo comando
   - Script `test:endpoint` para probar endpoints específicos

### Scripts adicionales

```bash
# Ejecutar todas las pruebas
npm run test:local

# Probar un endpoint específico
npm run test:endpoint movePallet

# Verificar tipos sin compilar
npm run typegen
```

### Estructura del Proyecto en TypeScript

```
/
├── models/                  # Modelos de datos (TypeScript)
│   ├── Box.ts               # Modelo de cajas
│   ├── Pallet.ts            # Modelo de pallets
│   ├── Issue.ts             # Modelo de incidencias
│   └── SystemConfig.ts      # Configuración del sistema
│
├── controllers/             # Controladores CRUD (TypeScript)
│   ├── boxes/
│   ├── pallets/
│   ├── issues/
│   ├── admin/
│   └── reports/
│
├── utils/                   # Utilidades (TypeScript)
│   ├── db.ts                # Utilidades de base de datos
│   ├── response.ts          # Formateador de respuestas API
│   ├── dynamoDb.ts          # Wrapper para DynamoDB
│   └── mockDb.ts            # Simulador de DB para pruebas
│
├── handlers/                # Manejadores Lambda
│   ├── movePallet.ts
│   ├── moveBox.ts
│   └── registerBox.ts
│
├── types/                   # Definiciones de tipos
│   └── index.ts             # Tipos centralizados
│
├── dist/                    # Archivos compilados (generados)
├── index.ts                 # Punto de entrada principal
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Configuración del proyecto
```

## TypeScript Conversion

This project has been fully converted to TypeScript to provide better type safety and developer experience. The TypeScript conversion includes:

1. Added TypeScript configuration in `tsconfig.json`
2. Created type definitions for all domain entities
3. Converted JavaScript files to TypeScript
4. Added build scripts for TypeScript compilation
5. Updated test scripts to work with TypeScript

### Project Structure

The project now follows these conventions:
- Source files are TypeScript (`.ts`)
- Compiled JavaScript files are placed in the `dist` directory
- Type definitions are in `types/index.ts`

### Available Scripts

- `npm run build` - Cleans and compiles TypeScript to JavaScript
- `npm run clean` - Removes the dist directory
- `npm run start` - Runs the compiled JavaScript
- `npm run dev` - Runs TypeScript in watch mode for development
- `npm run test:local` - Builds and runs the local test
- `npm run deploy` - Builds and packages the function for deployment

### Running Locally

To test the Lambda function locally:

```bash
npm run test:local
```

This will build the TypeScript code and run the local test that simulates an API Gateway event. 