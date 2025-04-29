# Modelos de DynamoDB

Este directorio contiene los modelos para la interacción con las tablas de DynamoDB.

## Estructura de Tablas

El sistema usa un sufijo `-dev` para las tablas cuando está en entorno de desarrollo
(rama `dev`), y sin sufijo para el entorno de producción (rama `main` o `master`).

### Tablas Disponibles

| Tabla Base      | Entorno Dev       | Entorno Producción |
|-----------------|-------------------|-------------------|
| Boxes           | Boxes-dev         | Boxes             |
| Pallets         | Pallets-dev       | Pallets           |
| Issues          | Issues-dev        | Issues            |
| AdminLogs       | AdminLogs-dev     | AdminLogs         |
| SystemConfig    | SystemConfig-dev  | SystemConfig      |

## Uso

Para usar estos modelos en tu código, importa el cliente de DynamoDB y el nombre de tabla:

```javascript
// Ejemplo para trabajar con la tabla Boxes
const { dynamoDB, tableName } = require('../models/boxes');

async function getBoxById(id) {
  const params = {
    TableName: tableName,
    Key: { id }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error('Error al obtener box:', error);
    throw error;
  }
}
```

## Entornos

El sistema detecta automáticamente el entorno mediante la variable de entorno `STAGE`:

- Si `STAGE=dev`, se usarán las tablas con sufijo `-dev`
- Si `STAGE` no está definido o tiene otro valor, se usarán las tablas sin sufijo

Esta variable es establecida automáticamente en los workflows de GitHub Actions:

- En el despliegue desde la rama `dev` → `STAGE=dev` → Tablas con sufijo `-dev`
- En el despliegue desde `main`/`master` → `STAGE=main` → Tablas sin sufijo 