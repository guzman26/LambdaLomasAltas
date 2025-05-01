# Guía de Prettier para Lambda Lomas Altas

Esta documentación explica cómo utilizar Prettier para mantener un estilo de código consistente en el proyecto Lambda Lomas Altas.

## ¿Qué es Prettier?

Prettier es un formateador de código que aplica un estilo consistente al analizar el código y reimprimirlo con sus propias reglas, tomando en cuenta la longitud máxima de línea y ajustando el código según sea necesario.

## Configuración en este proyecto

El proyecto utiliza la siguiente configuración de Prettier (`.prettierrc`):

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid"
}
```

También se ha configurado `.prettierignore` para excluir ciertos archivos y directorios que no deben ser formateados.

## Uso básico

El proyecto incluye varios scripts para utilizar Prettier de manera sencilla:

### Formatear todo el código

Para formatear todos los archivos del proyecto:

```bash
npm run format
```

### Verificar el formato sin modificar archivos

Para verificar si hay archivos que no cumplen con el formato (útil para CI/CD):

```bash
npm run format:check
```

### Formatear por directorios

Para formatear el código de manera selectiva por directorios:

```bash
npm run format:dirs
```

### Formatear archivos modificados

Para formatear solo los archivos que has modificado en git (muy útil antes de un commit):

```bash
npm run format:staged
```

## Integración con Git

Aunque no usamos Husky para hooks de git automáticos, puedes ejecutar manualmente:

```bash
npm run pre-commit
```

Antes de hacer un commit para asegurarte de que tu código está formateado correctamente.

## ¿Cuándo usar cada script?

- **En desarrollo diario**: Usa `npm run format:staged` antes de cada commit
- **Antes de un PR**: Usa `npm run format` para asegurarte de que todo el código está formateado
- **En CI/CD**: Usa `npm run format:check` para verificar que el código cumple con el formato

## Editor Integration

Para una mejor experiencia, puedes configurar tu editor para que use Prettier automáticamente:

### VS Code

1. Instala la extensión "Prettier - Code formatter"
2. Activa "Format On Save" en la configuración
3. Selecciona Prettier como el formateador predeterminado para JavaScript, TypeScript, etc.

### Otros editores

Prettier tiene integraciones para la mayoría de los editores populares. Consulta la [documentación oficial](https://prettier.io/docs/en/editors.html) para más detalles.
