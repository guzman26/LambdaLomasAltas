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