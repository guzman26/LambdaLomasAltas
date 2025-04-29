# Lambda Lomas Altas - Multi-entorno

Sistema de gestión de inventario para Lomas Altas con soporte para múltiples entornos (desarrollo y producción).

## Estructura de Entornos

El sistema está configurado para trabajar con dos entornos:

- **Desarrollo (dev)**: Utiliza tablas DynamoDB con sufijo `-dev` (ej. `Boxes-dev`)
- **Producción (main)**: Utiliza tablas DynamoDB sin sufijo (ej. `Boxes`)

## Modelos de Datos

Los modelos de datos para interactuar con DynamoDB se encuentran en el directorio `models/`. Cada modelo exporta:

- `dynamoDB`: Cliente compartido de DynamoDB
- `tableName`: Nombre de la tabla, que varía según el entorno

Ver [documentación de modelos](models/README.md) para más detalles.

## Configuración de Entorno

El entorno se detecta automáticamente mediante la variable de entorno `STAGE`:

- `STAGE=dev` → Tablas con sufijo `-dev`
- `STAGE=main` (o cualquier otro valor) → Tablas sin sufijo

## Despliegue

El sistema se despliega automáticamente mediante GitHub Actions:

- **Rama `dev`** → Se despliega automáticamente a una Lambda separada llamada `RegistrarHuevos-dev`
- **Rama `main` o `master`** → Se despliega automáticamente a la Lambda principal `RegistrarHuevos`

### Workflows de GitHub Actions

- [deploy.yml](.github/workflows/deploy.yml): Despliegue a producción
- [deploy-dev.yml](.github/workflows/deploy-dev.yml): Despliegue a desarrollo

## Creación de Tablas

Para inicializar las tablas en DynamoDB:

- **Tablas de desarrollo**: `npm run create-tables:dev`
- **Tablas de producción**: `npm run create-tables:prod`
- **Tablas locales** (para pruebas): `npm run create-tables:local`

## Estructura de Directorios

```
├── .github/workflows/      # Configuración de CI/CD (GitHub Actions)
├── handlers/               # Funciones de manejo de eventos 
├── models/                 # Modelos para DynamoDB (con soporte multi-entorno)
├── scripts/                # Scripts utilitarios (creación de tablas, etc.)
└── utils/                  # Funciones de utilidad general
```

## Beneficios del Enfoque Multi-entorno

- Desarrollo y pruebas sin afectar datos de producción
- Despliegue automático según la rama 
- Aislamiento completo de datos entre entornos
- Misma base de código para ambos entornos 