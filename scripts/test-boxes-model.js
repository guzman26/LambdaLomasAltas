#!/usr/bin/env node

/**
 * Script para probar el modelo de Boxes
 * Este script realiza un flujo de operaciones CRUD completo
 * sobre el modelo para verificar que funcione correctamente.
 */

// Cargar variables de entorno
try {
  require('dotenv').config();
  console.log('✅ Variables de entorno cargadas desde .env');
} catch (error) {
  console.log('⚠️ No se pudo cargar dotenv, continuando sin archivo .env');
}

// Importar el modelo de boxes
const boxesModel = require('../models/boxes');

// Colores para la consola
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m", 
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

/**
 * Función para ejecutar una prueba y mostrar resultados
 */
async function runTest(name, testFn) {
  console.log(`\n${colors.blue}⏳ Ejecutando prueba: ${name}${colors.reset}`);
  
  try {
    const result = await testFn();
    console.log(`${colors.green}✅ Prueba exitosa: ${name}${colors.reset}`);
    if (result !== undefined) {
      console.log(`${colors.cyan}Resultado:${colors.reset}`, JSON.stringify(result, null, 2));
    }
    return result;
  } catch (error) {
    console.error(`${colors.red}❌ Prueba fallida: ${name}${colors.reset}`);
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    throw error;
  }
}

/**
 * Flujo principal de pruebas
 */
async function runTests() {
  console.log(`\n${colors.magenta}==============================================${colors.reset}`);
  console.log(`${colors.magenta}     PRUEBAS DEL MODELO DE BOXES     ${colors.reset}`);
  console.log(`${colors.magenta}==============================================${colors.reset}`);
  
  console.log(`${colors.yellow}Tabla DynamoDB utilizada: ${boxesModel.tableName}${colors.reset}`);
  
  // ID único para evitar colisiones en pruebas repetidas
  const testId = `TEST-${Date.now()}`;
  const boxCodigo = `TEST-BOX-${testId}`;
  
  console.log(`${colors.yellow}ID de prueba: ${testId}${colors.reset}`);
  
  try {
    // 1. Crear un nuevo box de prueba
    const newBox = await runTest('Crear box de prueba', async () => {
      return await boxesModel.createBox({
        codigo: boxCodigo,
        ubicacion: 'PACKING',
        descripcion: 'Box de prueba para el test de modelo',
        peso: 12.5,
        calidad: 'AAA',
        testId // Para poder identificarlo después
      });
    });
    
    // 2. Verificar que el box existe
    await runTest('Verificar existencia del box', async () => {
      const exists = await boxesModel.boxExists(boxCodigo);
      if (!exists) throw new Error(`El box ${boxCodigo} no existe después de crearlo`);
      return exists;
    });
    
    // 3. Obtener el box por su código
    const retrievedBox = await runTest('Obtener box por código', async () => {
      return await boxesModel.getBoxByCode(boxCodigo);
    });
    
    // 4. Validar que los datos son correctos
    await runTest('Validar datos del box', async () => {
      if (retrievedBox.codigo !== boxCodigo) {
        throw new Error(`El código no coincide: ${retrievedBox.codigo} vs ${boxCodigo}`);
      }
      if (retrievedBox.ubicacion !== 'PACKING') {
        throw new Error(`La ubicación no coincide: ${retrievedBox.ubicacion} vs PACKING`);
      }
      if (retrievedBox.testId !== testId) {
        throw new Error(`El testId no coincide: ${retrievedBox.testId} vs ${testId}`);
      }
      return true;
    });
    
    // 5. Actualizar el box
    await runTest('Actualizar box', async () => {
      return await boxesModel.updateBox(boxCodigo, {
        ubicacion: 'BODEGA',
        peso: 13.2,
        observaciones: 'Box actualizado durante test'
      });
    });
    
    // 6. Verificar la actualización
    const updatedBox = await runTest('Verificar actualización', async () => {
      const box = await boxesModel.getBoxByCode(boxCodigo);
      if (box.ubicacion !== 'BODEGA') {
        throw new Error(`La ubicación no se actualizó: ${box.ubicacion} vs BODEGA`);
      }
      if (box.peso !== 13.2) {
        throw new Error(`El peso no se actualizó: ${box.peso} vs 13.2`);
      }
      if (!box.observaciones) {
        throw new Error('Las observaciones no se agregaron');
      }
      return box;
    });
    
    // 7. Mover el box a otra ubicación usando la función específica
    await runTest('Mover box a otra ubicación', async () => {
      return await boxesModel.moveBox(boxCodigo, 'VENTA');
    });
    
    // 8. Verificar el movimiento
    await runTest('Verificar movimiento', async () => {
      const box = await boxesModel.getBoxByCode(boxCodigo);
      if (box.ubicacion !== 'VENTA') {
        throw new Error(`La ubicación no se actualizó: ${box.ubicacion} vs VENTA`);
      }
      return box;
    });
    
    // 9. Asignar el box a un pallet
    const testPalletId = `TEST-PALLET-${testId}`;
    await runTest('Asignar box a pallet', async () => {
      return await boxesModel.assignBoxToPallet(boxCodigo, testPalletId);
    });
    
    // 10. Verificar la asignación
    await runTest('Verificar asignación a pallet', async () => {
      const box = await boxesModel.getBoxByCode(boxCodigo);
      if (box.palletId !== testPalletId) {
        throw new Error(`El palletId no se actualizó: ${box.palletId} vs ${testPalletId}`);
      }
      return box;
    });
    
    // 11. Buscar boxes por ubicación
    await runTest('Buscar boxes por ubicación (VENTA)', async () => {
      const boxes = await boxesModel.getBoxesByLocation('VENTA');
      if (!boxes.some(box => box.codigo === boxCodigo)) {
        throw new Error(`El box de prueba no aparece en la ubicación VENTA`);
      }
      return boxes.length; // Solo devolver cantidad para no saturar la consola
    });
    
    // 12. Buscar boxes por pallet
    await runTest('Buscar boxes por pallet', async () => {
      const boxes = await boxesModel.getBoxesByPallet(testPalletId);
      if (!boxes.some(box => box.codigo === boxCodigo)) {
        throw new Error(`El box de prueba no aparece en el pallet ${testPalletId}`);
      }
      return boxes.length;
    });
    
    // 13. Contar boxes por ubicación
    await runTest('Contar boxes por ubicación', async () => {
      return await boxesModel.countBoxesByLocation();
    });
    
    // 14. Eliminar el box de prueba
    await runTest('Eliminar box de prueba', async () => {
      return await boxesModel.deleteBox(boxCodigo);
    });
    
    // 15. Verificar que el box ya no existe
    await runTest('Verificar eliminación', async () => {
      const box = await boxesModel.getBoxByCode(boxCodigo);
      if (box) {
        throw new Error(`El box todavía existe después de eliminarlo`);
      }
      const exists = await boxesModel.boxExists(boxCodigo);
      if (exists) {
        throw new Error(`boxExists devuelve true para un box eliminado`);
      }
      return true;
    });
    
    // Resumen final
    console.log(`\n${colors.green}✅ TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO${colors.reset}`);
    console.log(`${colors.green}El modelo de boxes funciona correctamente${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}❌ PRUEBAS FALLIDAS${colors.reset}`);
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    
    // Intentar limpiar box de prueba incluso si hay error
    try {
      console.log(`${colors.yellow}⚠️ Intentando limpiar el box de prueba...${colors.reset}`);
      await boxesModel.deleteBox(boxCodigo);
    } catch (cleanupError) {
      console.error(`${colors.red}Error durante limpieza: ${cleanupError.message}${colors.reset}`);
    }
    
    process.exit(1);
  }
}

// Ejecutar las pruebas
runTests(); 