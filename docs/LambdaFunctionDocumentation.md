# Lambda Lomos Altas - Comprehensive Documentation

## Overview

Lambda Lomos Altas is an AWS Lambda-based API backend that manages an egg production and inventory tracking system. The system tracks boxes of eggs as they move through different stages of production and storage, including packing, warehouse (bodega), and sales (venta) locations. The system also manages pallets that contain multiple boxes of eggs.

## Architecture

### Components

1. **AWS Lambda Function**: The main entry point for all API requests
2. **Amazon DynamoDB**: Used as the database for storing all system data
3. **AWS API Gateway**: Exposes the Lambda function as a RESTful API (not directly visible in the code)
4. **AWS SDK**: Used for interacting with AWS services

### Data Models

The system uses several DynamoDB tables:

1. **Boxes**: Stores information about boxes of eggs
2. **Pallets**: Stores information about pallets that contain boxes
3. **Issues**: Tracks problems reported in the system
4. **MovementHistory**: Records the movement of boxes and pallets between locations
5. **SystemConfig**: Stores system configuration parameters
6. **AdminLogs**: Logs administrative actions

## Stage Management

The system supports multiple deployment stages:

- **dev**: Development environment
- **main**: Production environment

The stage is determined through the following priority:

1. Explicit `STAGE` environment variable
2. `NODE_ENV=production` indicates main/production environment
3. GitHub Actions branch detection
4. Default fallback to 'dev'

Table names are suffixed with `-dev` in the development environment.

## Code Structure

### Root Directory

- **index.js**: Main Lambda handler function that processes all incoming requests
- **package.json**: Node.js package configuration
- **buildspec.yml**: AWS CodeBuild configuration

### Models Directory

- **models/index.js**: Database connection setup and table names
- **models/boxes.js**: Box data operations
- **models/pallets.js**: Pallet data operations
- **models/issues.js**: Issue tracking operations
- **models/movementHistory.js**: Movement history tracking
- **models/systemConfig.js**: System configuration operations
- **models/adminLogs.js**: Administrative logging

### Handlers Directory

- **handlers/**: Contains all route handlers for different API endpoints
- **handlers/admin/**: Administrative operations handlers

### Utils Directory

- **utils/**: Utility functions used across the codebase

## Core Functionality

### Box Management

A box represents a container of eggs with the following key attributes:

- **codigo**: Unique identifier for the box (15-digit numeric string)
- **ubicacion**: Current location (PACKING, BODEGA, VENTA, TRANSITO)
- **calibre**: Egg size/caliber (2-digit code at positions 9-10 of codigo)
- **año**: Production year (derived from codigo)
- **semana**: Production week (derived from codigo)
- **dia_semana**: Day of the week (derived from codigo)
- **operario**: Operator ID (derived from codigo)
- **empacadora**: Packing machine ID (derived from codigo)
- **horario_proceso**: Process schedule - Morning/Afternoon (derived from codigo)
- **formato_caja**: Box format code (derived from codigo)
- **contador**: Sequential counter (derived from codigo)
- **palletId**: ID of the pallet it belongs to (if assigned)

Key operations:

- Create/register a new box
- Move a box between locations
- Assign a box to a pallet
- Unassign a box from a pallet
- Delete a box

### Pallet Management

A pallet is a larger container that holds multiple boxes with the following key attributes:

- **codigo**: Unique identifier for the pallet (12-digit numeric string)
- **ubicacion**: Current location (BODEGA, VENTA, TRANSITO)
- **estado**: Status (open, closed)
- **cajas**: Array of box codes contained in the pallet
- **cantidadCajas**: Count of boxes in the pallet
- **dia_semana**: Day of the week (derived from codigo)
- **semana**: Production week (derived from codigo)
- **año**: Production year (derived from codigo)
- **horario_proceso**: Process schedule - Morning/Afternoon (derived from codigo)
- **calibre**: Egg caliber code (derived from codigo)
- **formato_caja**: Box format code (derived from codigo)
- **contador**: Sequential counter (derived from codigo)

Key operations:

- Create a new pallet
- Move a pallet between locations
- Add boxes to a pallet
- Remove boxes from a pallet
- Close a pallet (finalize it for shipping/storage)
- Delete a pallet

### Movement Tracking

The system records all movements of boxes and pallets between locations:

- **codigo**: Item code (box or pallet)
- **itemType**: BOX or PALLET
- **fromLocation**: Previous location
- **toLocation**: New location
- **timestamp**: When the movement occurred
- **userId**: Who performed the action

### Issue Management

The system allows reporting and tracking issues:

- Report an issue
- Update issue status
- Retrieve issues by status or date range

### Reporting

The system provides various reporting capabilities:

- Generate movement history reports
- Generate inventory reports by location
- Export data to Excel format

## API Endpoints

### GET Endpoints

- **/getBodegaEggs**: Get eggs in the warehouse
- **/getPackingData**: Get eggs in packing
- **/getVentaData**: Get boxes in sales
- **/getEggsByDate**: Get eggs by production date
- **/production**: Get all boxes
- **/getPallets**: Get all pallets
- **/getActivePallets**: Get active (open) pallets
- **/getClosedPallets**: Get closed pallets
- **/getEggsByCodigo**: Get a specific egg box by code
- **/getUnassignedBoxesInPacking**: Get boxes in packing not assigned to a pallet
- **/admin/dashboard**: Get system dashboard data
- **/admin/issues**: Get reported issues
- **/getItemHistory**: Get movement history for a specific item
- **/getMovementHistory**: Get all movement history within a date range

### POST Endpoints

- **/procesar-escaneo**: Process a box or pallet scan (main entry point for scanning)
- **/AssignPallet**: Assign a pallet as active
- **/AssignBoxToPallet**: Assign a box to the active pallet
- **/movePallet**: Move a pallet to a new location
- **/closePallet**: Close a pallet
- **/createPallet**: Create a new pallet
- **/updateBoxDescription**: Update box description/custom info
- **/getBoxesInPallet**: Get boxes in a specific pallet
- **/getBoxByCode**: Get a box by its code
- **/unsubscribeBoxFromPallet**: Remove a box from a pallet
- **/postIssue**: Report an issue
- **/admin/updateIssueStatus**: Update issue status
- **/admin/auditAndFix**: Run audit and fix operations
- **/admin/backup**: Create a system backup

## Request Processing Flow

1. The Lambda function receives an API request via API Gateway
2. The main handler in index.js determines the route based on the request path
3. The appropriate handler function is called to process the request
4. The handler interacts with the models to perform database operations
5. An API response is created using the createApiResponse utility
6. The response is returned to the client

### Example: Box Registration Flow (Egg Scanning)

1. A scan request is received at **/procesar-escaneo**
2. The handler extracts the box code, location, and other data from the request
3. The system determines if it's a box or pallet based on code format
4. For a box in PACKING:
   - The system parses the box code to extract production data
   - The box is created in the database
   - The system finds an appropriate pallet with matching caliber
   - The box is assigned to the pallet
   - Movement history is recorded
5. The response is returned with the updated box information

## Error Handling

The system uses a standardized error handling approach:

- All database operations are wrapped in try/catch blocks
- Errors are caught, logged, and transformed into user-friendly messages
- HTTP status codes indicate the type of error

## Anti-Bounce Protection

The system implements protection against duplicate scans:

- Recently processed box codes are stored in memory
- Repeated scans within a short time window are detected and handled gracefully

## System Configuration

The system stores configuration values in the SystemConfig table:

- **ACTIVE_PALLET_CODE**: Currently active pallet for box assignment
- Other system settings as needed

## Reports and Data Export

The system can generate various reports:

- Excel reports with detailed inventory data
- Movement history reports by date range
- Custom reports based on specific criteria

## Administrative Functions

Administrative endpoints allow:

- Data auditing and correction
- System backup
- Issue management
- System dashboard for monitoring

## Scheduled Tasks

The Lambda function includes scheduled tasks for:

- Clearing the anti-bounce cache periodically
- Other maintenance tasks

## Security Considerations

- The system validates all inputs before processing
- Required parameters are checked for existence
- Location values are validated against allowed values
- Data integrity is maintained through transactions where needed

## Development and Deployment

- The system uses a multi-stage deployment approach (dev, main)
- Table names are suffixed based on the environment
- Environment detection logic determines the correct tables to use
- GitHub Actions likely handles CI/CD (referenced in the code)
