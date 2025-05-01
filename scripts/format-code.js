#!/usr/bin/env node

/**
 * Script para formatear el código con Prettier
 */

const { execSync } = require('child_process');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`\n${colors.magenta}==============================================${colors.reset}`);
console.log(`${colors.magenta}     FORMATEANDO CÓDIGO CON PRETTIER     ${colors.reset}`);
console.log(`${colors.magenta}==============================================${colors.reset}\n`);

// Carpetas para formatear
const directories = ['models', 'handlers', 'utils', 'scripts'];

try {
  console.log(`${colors.blue}Verificando archivos a formatear...${colors.reset}`);

  // Primero verificamos sin modificar nada (solo check)
  try {
    const checkOutput = execSync('npx prettier --check .', { encoding: 'utf8' });
    console.log(
      `${colors.green}✅ Todos los archivos ya están formateados correctamente${colors.reset}`
    );
    console.log(checkOutput);
    process.exit(0);
  } catch (checkError) {
    console.log(
      `${colors.yellow}⚠️ Se encontraron archivos que necesitan ser formateados${colors.reset}`
    );
    console.log(checkError.stdout);
  }

  // Formatear cada directorio
  directories.forEach(dir => {
    console.log(`\n${colors.blue}Formateando archivos en: ${dir}/${colors.reset}`);

    try {
      const output = execSync(`npx prettier --write "${dir}/**/*.js"`, { encoding: 'utf8' });
      console.log(`${colors.green}✅ Archivos formateados exitosamente en ${dir}/${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}❌ Error al formatear archivos en ${dir}/:${colors.reset}`);
      console.error(error.message);
    }
  });

  // Formatear archivos en la raíz
  console.log(`\n${colors.blue}Formateando archivos en el directorio raíz${colors.reset}`);
  try {
    const output = execSync('npx prettier --write "*.js"', { encoding: 'utf8' });
    console.log(
      `${colors.green}✅ Archivos formateados exitosamente en el directorio raíz${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}❌ Error al formatear archivos en el directorio raíz:${colors.reset}`
    );
    console.error(error.message);
  }

  // Verificar configuración/ignorados
  console.log(`\n${colors.blue}Formateando archivos de configuración${colors.reset}`);
  try {
    const output = execSync('npx prettier --write ".prettierrc" ".prettierignore"', {
      encoding: 'utf8',
    });
    console.log(
      `${colors.green}✅ Archivos de configuración formateados exitosamente${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}❌ Error al formatear archivos de configuración:${colors.reset}`);
    console.error(error.message);
  }

  console.log(`\n${colors.green}✅ Proceso de formateo completo${colors.reset}`);
} catch (error) {
  console.error(`\n${colors.red}❌ Error en el proceso de formateo:${colors.reset}`);
  console.error(error.message);
  process.exit(1);
}
