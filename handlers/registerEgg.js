const AWS = require('aws-sdk');
const createApiResponse = require('../utils/response');
const addBoxToPalletHandler = require('./addBoxToPallet');
const assignPallet = require('./assignPallet');
const createPallet = require('./createPallet');
const { parseBoxCode } = require('../utils/parseBoxCode');
const { parsePalletCode } = require('../utils/parsePalletCode');
const { createBox, getBoxByCode, boxExists, assignBoxToPallet } = require('../models/boxes');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Add a simple cache to prevent duplicate processing
const recentlyProcessedBoxes = new Map();
const PROCESSING_COOLDOWN = 2000; // 2 seconds between processing the same code

// Helper to clean up old entries from the cache
const cleanupCache = () => {
  const now = Date.now();
  for (const [code, timestamp] of recentlyProcessedBoxes.entries()) {
    if (now - timestamp > 10000) {
      // Remove entries older than 10 seconds
      recentlyProcessedBoxes.delete(code);
    }
  }
};

// Run cleanup every minute
setInterval(cleanupCache, 60000);
/**
 * Finds a pallet in 'active' state that matches specific box attributes
 */
const findMatchingPallet = async boxData => {
  const params = {
    TableName: 'Pallets',
    IndexName: 'estado-index', // Query only by estado
    KeyConditionExpression: '#estado = :estado',
    ExpressionAttributeNames: {
      '#estado': 'estado',
    },
    ExpressionAttributeValues: {
      ':estado': 'open',
    },
  };

  const result = await dynamoDB.query(params).promise();
  console.log(result.Items);
  const match = result.Items.find(p => {
    const { calibre, formato_caja, horario_proceso } = parsePalletCode(p.codigo);
    return p.ubicacion === 'PACKING' && calibre === boxData.calibre;
  });

  if (!match) throw new Error(`No hay pallet para asignar`);
  if (match?.cantidadCajas > 59) {
    throw new Error(`Pallet ${match.codigo} is full`);
  }

  return match || null;
};

/**
 * Registers a new egg box and automatically assigns it to a matching pallet if found.
 */
const registerEgg = async (code, _unusedPalletCode, palletCode, scannedCodes) => {
  // Check if this box was recently processed
  const now = Date.now();
  const lastProcessed = recentlyProcessedBoxes.get(code);

  if (lastProcessed && now - lastProcessed < PROCESSING_COOLDOWN) {
    console.log(
      `⚠️ Duplicate request for box ${code} detected - processed ${now - lastProcessed}ms ago`
    );
  }

  // Record this processing attempt
  recentlyProcessedBoxes.set(code, now);

  let parsedData, newBox;

  // Step 1: Parse the box code
  try {
    parsedData = parseBoxCode(code);
    console.log('📦 Box parsed successfully:', parsedData);
  } catch (parseError) {
    console.error('❌ Error parsing code:', parseError.message);
    return createApiResponse(400, `❌ Código inválido: ${parseError.message}`);
  }

  // Step 2: Create newBox object
  newBox = {
    codigo: code,
    ...parsedData,
    palletId: 'UNASSIGNED',
    fecha_registro: new Date().toISOString(),
    estado: 'PACKING',
    ubicacion: 'PACKING',
    ...(scannedCodes && { scannedCodes: JSON.stringify(scannedCodes) }),
  };

  // Step 3: Save the box to the DB
  try {
    await createBox(newBox);
  } catch (saveError) {
    console.error('❌ Error saving box:', saveError.message);
    return createApiResponse(500, `❌ Error guardando caja: ${saveError.message}`);
  }
  // Step 4: Determine palletCode if not provided
  if (!palletCode) {
    try {
      const pallet = await findMatchingPallet(newBox);
      palletCode = pallet?.codigo;
      console.log('🔍 Pallet encontrado automáticamente:', palletCode);
      const updatedPallet = await addBoxToPalletHandler(palletCode, newBox.codigo);
      return createApiResponse(200, `✅ Caja asignada al pallet ${updatedPallet.codigo}`, {
        ...newBox,
        palletId: updatedPallet.codigo,
      });
    } catch (matchError) {
      console.warn('⚠️ No matching pallet found:', matchError.message);
      palletCode = null;
      return createApiResponse(
        400,
        `⚠️ Caja registrada pero no se encontró pallet compatible`,
        newBox
      );
    }
  } else {
    try {
      // Verificar si el pallet ya existe para evitar duplicación
      const { Item: existingPallet } = await dynamoDB
        .get({
          TableName: 'Pallets',
          Key: { codigo: palletCode },
        })
        .promise();

      if (existingPallet) {
        // Verificar primero si la caja ya está en el pallet para evitar duplicación
        if (existingPallet.cajas && existingPallet.cajas.includes(newBox.codigo)) {
          // Si la caja ya está en el pallet, solo actualizar la referencia en la caja
          await dynamoDB
            .update({
              TableName: 'Boxes',
              Key: { codigo: newBox.codigo },
              UpdateExpression: 'SET palletId = :palletId',
              ExpressionAttributeValues: {
                ':palletId': palletCode,
              },
            })
            .promise();

          return createApiResponse(200, `✅ Caja ya asignada al pallet ${existingPallet.codigo}`, {
            ...newBox,
            palletId: existingPallet.codigo,
          });
        } else {
          // Si la caja no está en el pallet, proceder con la asignación normal
          const updatedPallet = await addBoxToPalletHandler(palletCode, newBox.codigo);
          return createApiResponse(200, `✅ Caja asignada al pallet ${updatedPallet.codigo}`, {
            ...newBox,
            palletId: updatedPallet.codigo,
          });
        }
      } else {
        // Si el pallet no existe, entonces lo creamos
        const assignedPalletResponse = await createPallet(palletCode, 'PACKING');
        const parsed = JSON.parse(assignedPalletResponse.body);
        const assignedPalletCode = parsed?.data?.codigo;
        const updatedPallet = await addBoxToPalletHandler(assignedPalletCode, newBox.codigo);
        return createApiResponse(200, `✅ Caja asignada al pallet ${updatedPallet.codigo}`, {
          ...newBox,
          palletId: updatedPallet.codigo,
        });
      }
    } catch (assignError) {
      console.error('❌ Error assigning pallet:', assignError.message);
      return createApiResponse(
        400,
        `❌ Caja registrada pero no pudo ser asignada (asignación fallida): ${assignError.message}`
      );
    }
  }

  // Step 6: No pallet available
  return createApiResponse(200, `⚠️ Caja registrada pero no se encontró pallet compatible`, newBox);
};

module.exports = registerEgg;
