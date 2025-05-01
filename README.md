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

El entorno se detecta automáticamente mediante la siguiente lógica (en orden de prioridad):

1. Variable de entorno `STAGE` (si está definida)
2. En entorno de producción (`NODE_ENV=production`), se usa el entorno principal
3. Detección de rama en GitHub Actions
4. Valor predeterminado: `dev`

### Archivos de Entorno

El sistema soporta configuración mediante:

- **Variables de entorno**: Configuradas directamente en el sistema
- **Archivo `.env`**: Para entorno de desarrollo local
- **Configuración de Lambda**: En AWS, configurada por GitHub Actions

### Scripts para Gestión de Entorno

```bash
# Crear archivo .env para entorno de desarrollo
npm run env:dev

# Crear archivo .env para entorno de producción
npm run env:prod

# Verificar el entorno actual y la configuración
npm run check-env
```

## Despliegue

El sistema se despliega automáticamente mediante GitHub Actions:

- **Rama `dev`** → Se despliega automáticamente a una Lambda separada llamada `RegistrarHuevos-dev`
- **Rama `main` o `master`** → Se despliega automáticamente a la Lambda principal `RegistrarHuevos`

### Workflows de GitHub Actions

- [deploy.yml](.github/workflows/deploy.yml): Despliegue a producción
- [deploy-dev.yml](.github/workflows/deploy-dev.yml): Despliegue a desarrollo

Los workflows realizan automáticamente:

1. Creación de archivo `.env` apropiado para el entorno
2. Configuración de variables de entorno en la Lambda
3. Empaquetado y despliegue del código

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
