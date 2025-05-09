# Lambda Lomos Altas - API Usage Guide

This guide provides detailed information on how to interact with the Lambda Lomos Altas API, including request formats, required parameters, and example responses.

## Base URL

The API is accessed through an AWS API Gateway endpoint. The base URL depends on your deployment environment:

- Production: `https://[production-api-id].execute-api.[region].amazonaws.com/production`
- Development: `https://[development-api-id].execute-api.[region].amazonaws.com/dev`

## Authentication

The API currently does not implement formal authentication. Security is handled through API Gateway settings.

## Response Format

All API responses follow this standard format:

```json
{
  "status": "success|error",
  "message": "Human-readable message describing the result",
  "data": { ... } // Optional payload data
}
```

## Common HTTP Status Codes

- `200`: Success
- `400`: Bad request (missing or invalid parameters)
- `404`: Resource not found
- `500`: Server error

## API Endpoints

### Box and Pallet Scanning

#### Process a Scan

**Endpoint:** `POST /procesar-escaneo`

This is the main entry point for scanning boxes and pallets. The system determines if it's a box or pallet based on the code format.

**Request Body:**

```json
{
  "codigo": "123451234512345", // 15-digit numeric box code
  "ubicacion": "PACKING", // PACKING, BODEGA, VENTA, TRANSITO
  "tipo": "BOX", // Optional: BOX or PALLET (auto-detected if not provided)
  "palletCodigo": "123451234123", // Optional: 12-digit numeric pallet code, only used when registering boxes in PACKING
  "scannedCodes": ["123451234512345", "..."] // Optional: Additional scanned codes
}
```

**Response (Box registered in PACKING):**

```json
{
  "status": "success",
  "message": "✅ Caja asignada al pallet PLA-AX-230610-001",
  "data": {
    "codigo": "LAAX20230610001",
    "calibre": "AX",
    "fecha": "2023-06-10",
    "secuencial": "001",
    "palletId": "PLA-AX-230610-001",
    "fecha_registro": "2023-06-10T15:30:45.123Z",
    "estado": "PACKING",
    "ubicacion": "PACKING"
  }
}
```

**Response (Box moved to location):**

```json
{
  "status": "success",
  "message": "✅ Caja movida a BODEGA exitosamente",
  "data": {
    "codigo": "LAAX20230610001",
    "ubicacion": "BODEGA",
    "updatedAt": "2023-06-11T10:15:30.456Z"
  }
}
```

**Response (Pallet moved to location):**

```json
{
  "status": "success",
  "message": "✅ Pallet movido a BODEGA exitosamente",
  "data": {
    "codigo": "PLA-AX-230610-001",
    "ubicacion": "BODEGA",
    "estado": "closed",
    "cantidadCajas": 50
  }
}
```

### Box Management

#### Get Box by Code

**Endpoint:** `POST /getBoxByCode`

**Request Body:**

```json
{
  "codigo": "LAAX20230610001"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Box data fetched successfully",
  "data": {
    "codigo": "LAAX20230610001",
    "calibre": "AX",
    "fecha": "2023-06-10",
    "palletId": "PLA-AX-230610-001",
    "ubicacion": "PACKING",
    "timestamp": "2023-06-10T15:30:45.123Z"
  }
}
```

#### Get Boxes by Date

**Endpoint:** `GET /getEggsByDate?fecha=2023-06-10`

**Response:**

```json
{
  "status": "success",
  "message": "Boxes fetched successfully",
  "data": [
    {
      "codigo": "LAAX20230610001",
      "calibre": "AX",
      "fecha": "2023-06-10",
      "palletId": "PLA-AX-230610-001",
      "ubicacion": "PACKING"
    }
    // More boxes...
  ]
}
```

#### Get Boxes by Location

**Endpoint:** `GET /getBodegaEggs` (for BODEGA location)
**Endpoint:** `GET /getPackingData` (for PACKING location)
**Endpoint:** `GET /getVentaData` (for VENTA location)

**Response:**

```json
{
  "status": "success",
  "message": "Boxes fetched successfully",
  "data": [
    {
      "codigo": "LAAX20230610001",
      "calibre": "AX",
      "fecha": "2023-06-10",
      "palletId": "PLA-AX-230610-001"
    }
    // More boxes...
  ]
}
```

#### Update Box Description

**Endpoint:** `POST /updateBoxDescription`

**Request Body:**

```json
{
  "codigo": "LAAX20230610001",
  "customInfo": {
    "observaciones": "Huevos extra grandes",
    "calidad": "Premium"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Box description updated successfully",
  "data": {
    "codigo": "LAAX20230610001",
    "customInfo": {
      "observaciones": "Huevos extra grandes",
      "calidad": "Premium"
    },
    "updatedAt": "2023-06-10T16:45:22.789Z"
  }
}
```

#### Delete Box

**Endpoint:** `POST /deleteBox`

**Request Body:**

```json
{
  "codigo": "LAAX20230610001"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Box deleted successfully",
  "data": true
}
```

### Pallet Management

#### Create Pallet

**Endpoint:** `POST /createPallet`

**Request Body:**

```json
{
  "codigo": "123451234123" // 12-digit numeric pallet code
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Pallet created successfully",
  "data": {
    "codigo": "PLA-AX-230610-001",
    "ubicacion": "PACKING",
    "estado": "open",
    "cajas": [],
    "cantidadCajas": 0,
    "fechaCreacion": "2023-06-10T14:20:30.123Z",
    "calibre": "AX"
  }
}
```

#### Assign a Pallet as Active

**Endpoint:** `POST /AssignPallet`

**Request Body:**

```json
{
  "codigo": "PLA-AX-230610-001"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Pallet assigned successfully",
  "data": {
    "palletCode": "PLA-AX-230610-001"
  }
}
```

#### Assign Box to Active Pallet

**Endpoint:** `POST /AssignBoxToPallet`

**Request Body:**

```json
{
  "codigo": "LAAX20230610001",
  "customInfo": {
    // Optional
    "observaciones": "Huevos extra grandes"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Box assigned to pallet successfully",
  "data": {
    "codigo": "LAAX20230610001",
    "calibre": "AX",
    "fecha": "2023-06-10",
    "palletId": "PLA-AX-230610-001",
    "ubicacion": "PACKING",
    "customInfo": {
      "observaciones": "Huevos extra grandes"
    }
  }
}
```

#### Remove Box from Pallet

**Endpoint:** `POST /unsubscribeBoxFromPallet`

**Request Body:**

```json
{
  "boxCode": "LAAX20230610001",
  "palletId": "PLA-AX-230610-001"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Box unsubscribed from pallet successfully",
  "data": {
    "boxCode": "LAAX20230610001",
    "palletId": "UNASSIGNED"
  }
}
```

#### Close Pallet

**Endpoint:** `POST /closePallet`

**Request Body:**

```json
{
  "codigo": "PLA-AX-230610-001"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Pallet closed successfully",
  "data": {
    "codigo": "PLA-AX-230610-001",
    "estado": "closed",
    "fechaCierre": "2023-06-11T09:30:15.678Z",
    "cantidadCajas": 50
  }
}
```

#### Move Pallet

**Endpoint:** `POST /movePallet`

**Request Body:**

```json
{
  "codigo": "PLA-AX-230610-001",
  "ubicacion": "BODEGA" // Target location (BODEGA, VENTA, TRANSITO)
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Pallet moved to BODEGA successfully",
  "data": {
    "codigo": "PLA-AX-230610-001",
    "ubicacion": "BODEGA",
    "estado": "closed",
    "cantidadCajas": 50
  }
}
```

#### Get Pallets

**Endpoint:** `GET /getPallets`

**Response:**

```json
{
  "status": "success",
  "message": "Pallets fetched successfully",
  "data": [
    {
      "codigo": "PLA-AX-230610-001",
      "ubicacion": "BODEGA",
      "estado": "closed",
      "cantidadCajas": 50,
      "fechaCreacion": "2023-06-10T14:20:30.123Z",
      "fechaCierre": "2023-06-11T09:30:15.678Z"
    }
    // More pallets...
  ]
}
```

#### Get Active Pallets

**Endpoint:** `GET /getActivePallets`

Gets pallets with estado="open".

**Response:**

```json
{
  "status": "success",
  "message": "Active pallets fetched successfully",
  "data": [
    {
      "codigo": "PLA-AX-230610-002",
      "ubicacion": "PACKING",
      "estado": "open",
      "cantidadCajas": 25,
      "fechaCreacion": "2023-06-10T16:40:10.456Z"
    }
    // More active pallets...
  ]
}
```

#### Get Closed Pallets

**Endpoint:** `GET /getClosedPallets?ubicacion=BODEGA`

Gets pallets with estado="closed" and optional ubicacion filter.

**Response:**

```json
{
  "status": "success",
  "message": "Closed pallets fetched successfully",
  "data": [
    {
      "codigo": "PLA-AX-230610-001",
      "ubicacion": "BODEGA",
      "estado": "closed",
      "cantidadCajas": 50,
      "fechaCreacion": "2023-06-10T14:20:30.123Z",
      "fechaCierre": "2023-06-11T09:30:15.678Z"
    }
    // More closed pallets...
  ]
}
```

#### Get Boxes in Pallet

**Endpoint:** `POST /getBoxesInPallet`

**Request Body:**

```json
{
  "codigo": "PLA-AX-230610-001"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Boxes in pallet fetched successfully",
  "data": {
    "pallet": {
      "codigo": "PLA-AX-230610-001",
      "ubicacion": "BODEGA",
      "estado": "closed",
      "cantidadCajas": 50
    },
    "boxes": [
      {
        "codigo": "LAAX20230610001",
        "calibre": "AX",
        "fecha": "2023-06-10"
      }
      // More boxes...
    ]
  }
}
```

#### Delete Pallet

**Endpoint:** `POST /deletePallet`

**Request Body:**

```json
{
  "codigo": "PLA-AX-230610-001"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Pallet deleted successfully",
  "data": true
}
```

### Movement History

#### Get Item History

**Endpoint:** `POST /getItemHistory`

**Request Body:**

```json
{
  "codigo": "LAAX20230610001" // Box or pallet code
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Movement history fetched successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "codigo": "LAAX20230610001",
      "itemType": "BOX",
      "fromLocation": "PACKING",
      "toLocation": "BODEGA",
      "timestamp": "2023-06-11T10:15:30.456Z",
      "userId": "system"
    }
    // More movement records...
  ]
}
```

#### Get Movement History by Date Range

**Endpoint:** `GET /getMovementHistory?startDate=2023-06-10T00:00:00.000Z&endDate=2023-06-11T23:59:59.999Z`

**Response:**

```json
{
  "status": "success",
  "message": "Movement history fetched successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "codigo": "LAAX20230610001",
      "itemType": "BOX",
      "fromLocation": "PACKING",
      "toLocation": "BODEGA",
      "timestamp": "2023-06-11T10:15:30.456Z",
      "userId": "system"
    }
    // More movement records...
  ]
}
```

### Issues Management

#### Report an Issue

**Endpoint:** `POST /postIssue`

**Request Body:**

```json
{
  "descripcion": "Se encontraron huevos rotos en el pallet PLA-AX-230610-001"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Issue reported successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "descripcion": "Se encontraron huevos rotos en el pallet PLA-AX-230610-001",
    "status": "PENDIENTE",
    "timestamp": "2023-06-11T14:25:40.789Z"
  }
}
```

#### Update Issue Status

**Endpoint:** `POST /admin/updateIssueStatus`

**Request Body:**

```json
{
  "issueId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "RESUELTA",
  "resolution": "Se reemplazaron los huevos rotos"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Issue status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "RESUELTA",
    "resolution": "Se reemplazaron los huevos rotos",
    "resolutionTimestamp": "2023-06-11T16:35:20.123Z"
  }
}
```

#### Get Issues

**Endpoint:** `GET /admin/issues?status=PENDIENTE&startDate=2023-06-01&endDate=2023-06-15`

Query parameters:

- `status`: Filter by status (PENDIENTE, EN_PROGRESO, RESUELTA)
- `startDate`: Filter by date range start (YYYY-MM-DD)
- `endDate`: Filter by date range end (YYYY-MM-DD)

**Response:**

```json
{
  "status": "success",
  "message": "Issues fetched successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "descripcion": "Problema con el lector de códigos en zona de packing",
      "status": "PENDIENTE",
      "timestamp": "2023-06-12T09:15:30.456Z"
    }
    // More issues...
  ]
}
```

### Administrative Operations

#### System Dashboard

**Endpoint:** `GET /admin/dashboard`

**Response:**

```json
{
  "status": "success",
  "message": "Dashboard data fetched successfully",
  "data": {
    "boxesByLocation": {
      "PACKING": 125,
      "BODEGA": 540,
      "VENTA": 230,
      "TRANSITO": 60
    },
    "palletsByStatus": {
      "open": 3,
      "closed": 15
    },
    "issuesByStatus": {
      "PENDIENTE": 2,
      "EN_PROGRESO": 1,
      "RESUELTA": 5
    },
    "todayActivity": {
      "boxesRegistered": 45,
      "boxesMoved": 120,
      "palletsClosed": 2
    }
  }
}
```

#### Audit and Fix Data

**Endpoint:** `POST /admin/auditAndFix`

This endpoint performs validation and fixes inconsistencies in the database (e.g., boxes assigned to non-existent pallets).

**Response:**

```json
{
  "status": "success",
  "message": "Audit and fix completed successfully",
  "data": {
    "scanned": 945,
    "issues": 3,
    "fixed": 3,
    "details": [
      "Fixed: Box LAAX20230610045 was assigned to non-existent pallet",
      "Fixed: Pallet PLA-AX-230610-003 had incorrect box count",
      "Fixed: Box LAAX20230611012 had invalid location"
    ]
  }
}
```

#### Backup Data

**Endpoint:** `POST /admin/backup`

Triggers a backup of the database.

**Response:**

```json
{
  "status": "success",
  "message": "Backup completed successfully",
  "data": {
    "timestamp": "2023-06-15T23:00:00.000Z",
    "location": "s3://lambda-lomos-altas-backups/backup-20230615230000.json",
    "tables": ["Boxes", "Pallets", "Issues", "MovementHistory", "SystemConfig"]
  }
}
```

### Report Generation

#### Generate Movement History Report

**Endpoint:** `POST /generateReport`

**Request Body:**

```json
{
  "type": "movement",
  "startDate": "2023-06-01",
  "endDate": "2023-06-15"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Report generated successfully",
  "data": {
    "report": [
      {
        "codigo": "LAAX20230610001",
        "itemType": "BOX",
        "fromLocation": "PACKING",
        "toLocation": "BODEGA",
        "timestamp": "2023-06-11T10:15:30.456Z",
        "userId": "system"
      }
      // More movement records...
    ]
  }
}
```

#### Generate Excel Report

**Endpoint:** `POST /generateExcelReport`

**Request Body:**

```json
{
  "reportType": "inventory", // inventory, movements, pallets
  "filter": {
    "ubicacion": "BODEGA", // Optional
    "startDate": "2023-06-01", // Optional
    "endDate": "2023-06-15" // Optional
  }
}
```

**Response:**

Binary file download with Excel report.

## Error Handling

### Example Error Response

```json
{
  "status": "error",
  "message": "Missing parameters: codigo, ubicacion",
  "data": null
}
```

### Common Error Messages

1. **Missing Parameters**

   ```json
   {
     "status": "error",
     "message": "Missing parameters: codigo, ubicacion",
     "data": null
   }
   ```

2. **Invalid Location**

   ```json
   {
     "status": "error",
     "message": "Invalid location: INVALIDA. Valid options: PACKING, BODEGA, VENTA, TRANSITO",
     "data": null
   }
   ```

3. **Item Not Found**

   ```json
   {
     "status": "error",
     "message": "Box with code LAAX20230610999 not found",
     "data": null
   }
   ```

4. **Data Validation Error**

   ```json
   {
     "status": "error",
     "message": "Invalid code format",
     "data": null
   }
   ```

5. **Box Already Assigned**
   ```json
   {
     "status": "error",
     "message": "Box LAAX20230610001 is already assigned to pallet PLA-AX-230610-002",
     "data": null
   }
   ```

## Best Practices

1. **Always validate responses**: Check the "status" field to determine if the request was successful.
2. **Include all required parameters**: Verify that all required parameters are included in your requests.
3. **Handle network errors**: Implement retry logic for network failures.
4. **Use proper date formats**: Use ISO format (YYYY-MM-DDTHH:MM:SS.sssZ) for date parameters.
5. **Implement anti-bounce logic**: The API has built-in anti-bounce protection, but you should also implement debouncing in your client application when dealing with barcode scanners.

function parseBoxCode(codigo) {
// Validate format
if (!codigo.match(/^LA[A-Z]{2}\d{8}\d{3}$/)) {
throw new Error('Formato de código inválido');
}

// Extract components
const calibre = codigo.substring(2, 4); // "AX"
const fechaStr = codigo.substring(4, 12); // "20230610"
const secuencial = codigo.substring(12, 15); // "001"

// Parse date
const year = parseInt(fechaStr.substring(0, 4));
const month = parseInt(fechaStr.substring(4, 6)) - 1;
const day = parseInt(fechaStr.substring(6, 8));
const fecha = new Date(year, month, day).toISOString().split('T')[0];

return {
calibre,
fecha,
secuencial,
};
}

function parsePalletCode(codigo) {
// Validate format
if (!codigo.match(/^PLA-[A-Z]{2}-\d{6}-\d{3}$/)) {
throw new Error('Formato de código de pallet inválido');
}

// Extract components
const parts = codigo.split('-');
const calibre = parts[1]; // "AX"
const fechaStr = parts[2]; // "230610"
const secuencial = parts[3]; // "001"

// Parse date
const year = parseInt(`20${fechaStr.substring(0, 2)}`);
const month = parseInt(fechaStr.substring(2, 4)) - 1;
const day = parseInt(fechaStr.substring(4, 6));
const fecha = new Date(year, month, day).toISOString().split('T')[0];

return {
calibre,
fecha,
secuencial,
};
}
