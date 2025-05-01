#!/usr/bin/env node

/**
 * Script para formatear solo los archivos modificados en git
 * Útil para ejecutar antes de un commit
 */

const { execSync } = require('child_process');

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
console.log(`${colors.magenta}  FORMATEO DE ARCHIVOS MODIFICADOS CON PRETTIER  ${colors.reset}`);
console.log(`${colors.magenta}==============================================${colors.reset}\n`);

try {
  // Obtener archivos modificados y preparados para commit
  console.log(`${colors.blue}Buscando archivos modificados...${colors.reset}`);

  // Archivos en el área de preparación (staged)
  const stagedFilesOutput = execSync('git diff --staged --name-only', { encoding: 'utf8' });
  const stagedFiles = stagedFilesOutput.split('\n').filter(f => f.trim().length > 0);

  // Archivos modificados pero no preparados
  const modifiedFilesOutput = execSync('git diff --name-only', { encoding: 'utf8' });
  const modifiedFiles = modifiedFilesOutput.split('\n').filter(f => f.trim().length > 0);

  // Archivos sin seguimiento
  const untrackedFilesOutput = execSync('git ls-files --others --exclude-standard', {
    encoding: 'utf8',
  });
  const untrackedFiles = untrackedFilesOutput.split('\n').filter(f => f.trim().length > 0);

  // Filtrar solo archivos que Prettier puede formatear
  const extensions = ['.js', '.json', '.jsx', '.ts', '.tsx', '.md', '.yml', '.yaml'];
  const filterByExtensions = file => extensions.some(ext => file.endsWith(ext));

  const stagedFilesToFormat = stagedFiles.filter(filterByExtensions);
  const modifiedFilesToFormat = modifiedFiles.filter(filterByExtensions);
  const untrackedFilesToFormat = untrackedFiles.filter(filterByExtensions);

  console.log(`${colors.blue}Archivos encontrados:${colors.reset}`);
  console.log(`${colors.green}- Preparados (staged):${colors.reset} ${stagedFilesToFormat.length}`);
  console.log(
    `${colors.yellow}- Modificados (sin preparar):${colors.reset} ${modifiedFilesToFormat.length}`
  );
  console.log(`${colors.cyan}- Sin seguimiento:${colors.reset} ${untrackedFilesToFormat.length}`);

  // Formatear archivos
  let formattedCount = 0;

  // 1. Formatear archivos preparados (staged)
  if (stagedFilesToFormat.length > 0) {
    console.log(`\n${colors.green}Formateando archivos preparados (staged):${colors.reset}`);

    for (const file of stagedFilesToFormat) {
      try {
        console.log(`  Formateando: ${file}`);
        execSync(`npx prettier --write "${file}"`, { encoding: 'utf8' });
        // Volver a añadir el archivo al área de preparación después de formatearlo
        execSync(`git add "${file}"`, { encoding: 'utf8' });
        formattedCount++;
      } catch (error) {
        console.error(`${colors.red}❌ Error al formatear ${file}:${colors.reset}`, error.message);
      }
    }
  }

  // 2. Preguntar si se desea formatear los archivos modificados pero no preparados
  if (modifiedFilesToFormat.length > 0) {
    console.log(
      `\n${colors.yellow}¿Formatear ${modifiedFilesToFormat.length} archivos modificados (sin preparar)?${colors.reset}`
    );
    console.log(`${colors.yellow}Para formatearlos, ejecuta:${colors.reset}`);
    console.log(`npx prettier --write ${modifiedFilesToFormat.map(f => `"${f}"`).join(' ')}`);
  }

  // 3. Preguntar si se desea formatear los archivos sin seguimiento
  if (untrackedFilesToFormat.length > 0) {
    console.log(
      `\n${colors.cyan}¿Formatear ${untrackedFilesToFormat.length} archivos sin seguimiento?${colors.reset}`
    );
    console.log(`${colors.cyan}Para formatearlos, ejecuta:${colors.reset}`);
    console.log(`npx prettier --write ${untrackedFilesToFormat.map(f => `"${f}"`).join(' ')}`);
  }

  console.log(
    `\n${colors.green}✅ Se formatearon ${formattedCount} archivos en total${colors.reset}`
  );
} catch (error) {
  console.error(`\n${colors.red}❌ Error:${colors.reset}`, error.message);
  process.exit(1);
}
