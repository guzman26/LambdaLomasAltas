# Lambda Registrar Huevos

Esta aplicación sirve para registrar datos en una tabla DynamoDB usando AWS Lambda.

## Requisitos previos

- Node.js (recomendado v18.x)
- npm o yarn
- Docker (opcional, para ejecutar LocalStack)
- Cuenta de AWS y credenciales configuradas para despliegue

## Configuración

1. Instala las dependencias:

```bash
npm install
```

2. Asegúrate de tener una instancia de DynamoDB ejecutándose:

   - Opción 1: Usa LocalStack con Docker:

   ```bash
   docker run --rm -it -p 4566:4566 localstack/localstack
   ```

   - Opción 2: Configura un endpoint de DynamoDB real cambiando la URL en el serverless.yml

3. Crea la tabla en DynamoDB (solo para desarrollo local):

```bash
npm run create-table
```

## Ejecutar localmente

Para iniciar el servidor Serverless Offline:

```bash
npm run start
```

El servidor estará disponible en http://localhost:3000

## Ejecutar pruebas automatizadas

Se ha implementado un script de pruebas automatizadas que verifica el correcto funcionamiento de la lambda. Para ejecutarlo:

1. Asegúrate de que LocalStack esté corriendo:

```bash
docker run --rm -it -p 4566:4566 localstack/localstack
```

2. Ejecuta el script de pruebas:

```bash
npm run test:local
```

El script realiza las siguientes pruebas:

- Inicia automáticamente el servidor serverless-offline
- Caso 1: Registro con ID e info completos
- Caso 2: Registro solo con ID (info por defecto)
- Caso 3: Registro solo con info (ID por defecto) 
- Caso 4: Actualización de un registro existente
- Verifica que los datos se hayan guardado correctamente en DynamoDB
- Limpia todos los datos de prueba al finalizar

## Endpoints

- **POST /huevos**: Registra un nuevo huevo
  - Cuerpo de la solicitud (JSON):
    ```json
    {
      "id": "identificador-único",
      "info": "información-adicional"
    }
    ```

## Probar la API

Puedes probar la API usando curl:

```bash
curl -X POST http://localhost:3000/huevos \
  -H "Content-Type: application/json" \
  -d '{"id": "huevo001", "info": "primera prueba"}'
```

## Despliegue en AWS

### Requisitos previos para despliegue

1. Configura tus credenciales de AWS:

```bash
aws configure
```

2. (Opcional) Para desplegar en un entorno específico:

```bash
npm run deploy -- --stage production
```

Por defecto, se despliega en el entorno 'dev'.

### Estructura de despliegue

Al desplegar, se crearán automáticamente:

1. Una función Lambda
2. Una tabla DynamoDB con nombre `Huevos-{stage}` (por ejemplo: `Huevos-dev` o `Huevos-production`)
3. Un punto de conexión API Gateway para acceder a la función

### Ejecutar el despliegue

```bash
npm run deploy
```

### Verificar despliegue

Una vez completado el despliegue, verás en la terminal la URL del endpoint. Puedes probar el endpoint con:

```bash
curl -X POST https://tu-api-id.execute-api.us-east-2.amazonaws.com/dev/huevos \
  -H "Content-Type: application/json" \
  -d '{"id": "huevo001", "info": "primera prueba"}'
```

### Eliminar los recursos

Si necesitas eliminar todos los recursos creados en AWS:

```bash
npx serverless remove
``` 