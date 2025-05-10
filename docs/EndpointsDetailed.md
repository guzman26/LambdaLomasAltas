# Lomas Altas Serverless API  
*(AWS Lambda + API Gateway – egg-farm logistics)*  

## Table of Contents
1. [High-Level Overview](#high-level-overview)  
2. [Standard Response Envelope](#standard-response-envelope)  
3. [Core Resources](#core-resources)  
   * [Egg & Box](#egg--box)  
   * [Scanning & Movement](#scanning--movement)  
   * [Pallet Management](#pallet-management)  
   * [Lookup Utilities](#lookup-utilities)  
4. [Issue Tracking](#issue-tracking)  
5. [Reports & Admin](#reports--admin)  
6. [System Config](#system-config)  
7. [Sales Mini-Module](#sales-mini-module)  
8. [Data Models](#data-models)  
9. [Error Codes](#error-codes)  
10. [Glossary / Enums](#glossary--enums)  

---

## High-Level Overview
All paths are relative to the stage URL:

```
https://{rest-api-id}.execute-api.{region}.amazonaws.com/production
```

Authentication is **(TODO)** – current dev instances run open, but production will require a
`x-api-key` or Cognito/JWT header.

---

## Standard Response Envelope
Every handler returns JSON via a helper `createApiResponse(code, message, data)`:

```jsonc
{
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "body": "{ \"status\": \"success\", \"message\": \"OK\", \"data\": … }"
}
```

*Non-200* replies use `"status": "error"` and include an `errorCode`
(see [Error Codes](#error-codes)).

---

## Core Resources

### Egg & Box
| Verb | Path | Description | Params |
|------|------|-------------|--------|
| GET  | `/getBodegaEggs` | Boxes in **BODEGA** | – |
| GET  | `/getPackingData` | Boxes in **PACKING** ∪ **TRANSITO** | – |
| GET  | `/getVentaData`   | Boxes ready for sale (**VENTA**) | – |
| GET  | `/getEggsByDate`  | Filter by `fechaInicio`, `fechaFin` (YYYY-MM-DD) | query |
| GET  | `/production`     | Swiss-army listing (+ pagination) | query `codigo`, `ubicacion`, `palletId`, `limit`, `lastKey` |
| POST | `/updateBoxDescription` | Replace `customInfo.descripcion` | body `codigo`, `descripcion` |
| POST | `/unsubscribeBoxFromPallet` | Detach box w/o delete | body `boxCode`, `palletId` |

---

### Scanning & Movement
| Verb | Path | Purpose | Notes |
|------|------|---------|-------|
| POST | `/procesar-escaneo` | Mobile scanner entry-point | Infers **BOX** vs **PALLET** |
| POST | `/movePallet` | Move pallet to new `ubicacion` | – |
| POST | `/moveBox` *(NEW)* | Same for a single box | **TODO: implement** |

---

### Pallet Management
| Verb | Path | Action |
|------|------|--------|
| POST | `/createPallet`              | Create **OPEN** pallet |
| POST | `/AssignPallet`             | Mark pallet as *active* |
| POST | `/AssignBoxToPallet`        | Register brand-new box in active pallet |
| POST | `/addBoxToPallet`           | Add existing box to pallet |
| POST | `/closePallet`              | Lock pallet (**CLOSED**) |
| GET  | `/getPallets`               | List with filters |
| GET  | `/getActivePallets`         | Quick open pallets |
| GET  | `/getClosedPallets`         | Quick closed pallets |
| GET  | `/getBoxesInPallet`         | Contents of one pallet |

---

### Lookup Utilities
| Verb | Path | Returns |
|------|------|---------|
| GET  | `/getEggsByCodigo`          | Single box |
| POST | `/getBoxByCode`             | Same via POST |
| GET  | `/getUnassignedBoxesInPacking` | PACKING boxes w/o pallet |
| GET  | `/getItemHistory`           | Movements for one item |
| GET  | `/getMovementHistory`       | All movements in range |

---

## Issue Tracking
| Verb | Path | Purpose |
|------|------|---------|
| POST | `/postIssue`                     | Submit issue |
| GET  | `/admin/issues`                  | List issues |
| POST | `/admin/updateIssueStatus`       | Bulk status update |
| POST | `/admin/issues/{id}/status`      | Update one |
| POST | `/admin/issues/delete`           | Hard delete |

---

## Reports & Admin
### This part hasn't been tested yet
| Verb | Path | Description |
|------|------|-------------|
| GET  | `/admin/dashboard`            | KPI snapshot |
| POST | `/admin/auditAndFix`          | Auto-repair DB links |
| POST | `/admin/backup`               | Dump DynamoDB to S3 |
| POST | `/admin/generateReport`       | PDF (presigned URL) |
| POST | `/admin/generateExcelReport`  | XLSX |
| POST | `/admin/generateCustomReport` | Custom XLSX |
| POST | `/admin/deleteBox`            | Hard-delete box |
| POST | `/admin/deletePallet`         | Hard-delete pallet |

---

## System Config
| Verb | Path | Purpose |
|------|------|---------|
| GET  | `/admin/config`      | List all config keys |
| PUT  | `/admin/config/{k}`  | Upsert one key |
| PUT  | `/admin/config/bulk` | Upsert many (keys→values) |

---

## Sales Mini-Module
#### This part is not implemented, maybe there's a better way to do it or consider using a different data model
### Customers
| Verb | Path | Action |
|------|------|--------|
| POST | `/customers`                 | Create customer |
| GET  | `/customers`                 | List/search |
| PATCH| `/customers/{id}`            | Update |

### Sales Orders
| Verb | Path | Action |
|------|------|--------|
| POST | `/sales`                     | Draft sale |
| POST | `/sales/{saleId}/confirm`    | Confirm (moves items → **SOLD**) |
| POST | `/sales/{saleId}/cancel`     | Cancel (before dispatch) |
| GET  | `/sales`                     | List sales |
| GET  | `/sales/{saleId}`            | Detail |

### Sales Reports
`GET /reports/sales` – totals by day or customer

---

## Data Models
<details>
<summary>Box (simplified)</summary>

```jsonc
{
  "codigo": "LAAX20230610001",
  "calibre": "AX",
  "fecha": "2023-06-10",
  "ubicacion": "BODEGA",
  "palletId": "PLA-AX-230610-001",
  "estado": "OK",
  "customInfo": { "descripcion": "…" },
  "soldTo": "CUST-001",
  "soldAt": "2025-05-09T20:10:00Z"
}
```
</details>

<details>
<summary>Pallet (simplified)</summary>

```jsonc
{
  "codigo": "PLA-AX-230610-001",
  "estado": "open",
  "ubicacion": "BODEGA",
  "boxCount": 48,
  "createdAt": "2023-06-10T16:55:00Z",
  "closedAt": null,
  "soldTo": "CUST-001"
}
```
</details>

---

## Error Codes
| Code | Meaning |
|------|---------|
| `BOX_NOT_FOUND`         | `codigo` not in DB |
| `PALLET_CLOSED`         | Tried to modify closed pallet |
| `INVALID_LOCATION`      | Bad `ubicacion` value |
| `SALE_ALREADY_CONFIRMED`| Cannot re-confirm |

---

## Glossary / Enums
```ts
type Ubicacion =
  'BODEGA' | 'PACKING' | 'TRANSITO' | 'VENTA' |
  'RECHAZO' | 'CUARENTENA' | 'SOLD';

type PalletEstado = 'open' | 'closed' | 'dismantled';
```

---

## What’s still missing?
1. **Auth** – API Key / Cognito JWT.  
2. **Pagination** – replicate pattern across lists.  
3. **OpenAPI `/docs`**.  
4. **Tests & Postman collection**.  
5. **CI/CD** (SAM/CDK/SST).  
6. **Rate limiting / WAF**.  
7. **Complete error code list**.  
8. **MoveBox handler** implementation.  
9. **Inventory adjustments** endpoint.
