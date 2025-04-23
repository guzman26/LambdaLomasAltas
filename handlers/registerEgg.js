const AWS = require("aws-sdk");
const createApiResponse = require("../utils/response");
const addBoxToPallet = require("./addBoxToPallet");
const assignPallet = require("./assignPallet");
const createPallet = require("./createPallet");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Add a simple cache to prevent duplicate processing
const recentlyProcessedBoxes = new Map();
const PROCESSING_COOLDOWN = 2000; // 2 seconds between processing the same code

// Helper to clean up old entries from the cache
const cleanupCache = () => {
  const now = Date.now();
  for (const [code, timestamp] of recentlyProcessedBoxes.entries()) {
    if (now - timestamp > 10000) { // Remove entries older than 10 seconds
      recentlyProcessedBoxes.delete(code);
    }
  }
};

// Run cleanup every minute
setInterval(cleanupCache, 60000);

/**
 * Parses a box code into its components
 * @param {string} code - 15-digit box code
 * @returns {object} Parsed code components
 * @throws {Error} If code format is invalid
 */
const parseBoxCode = (code) => {
    if (!code || typeof code !== 'string') {
        throw new Error(`Código inválido: formato incorrecto`);
    }
    
    if (code.length !== 15) {
        throw new Error(`Código inválido: ${code} (longitud incorrecta, debe tener 15 dígitos)`);
    }

    // Validar que el código contiene solo dígitos
    if (!/^\d+$/.test(code)) {
        throw new Error(`Código inválido: ${code} (debe contener solo dígitos)`);
    }

    return {
        dia_semana: code.slice(0, 1),
        semana: code.slice(1, 3),
        año: `20${code.slice(3, 5)}`,
        operario: code.slice(5, 7),
        empacadora: code.slice(7, 8),
        horario_proceso: code.slice(8, 9) === "1" ? "Mañana" : "Tarde",
        calibre: code.slice(9, 11),
        formato_caja: code.slice(11, 12),
        contador: code.slice(12, 15),
    };
};

const parsePalletCode = (code) => {
    if (!code || typeof code !== 'string') {
        throw new Error(`Código de pallet inválido: formato incorrecto`);
    }
    
    if (code.length !== 12) {
        console.log(code.length)
        throw new Error(`Código de pallet inválido: ${code} (longitud incorrecta, debe tener 12 dígitos)`);
    }

    // Validar que el código contiene solo dígitos
    if (!/^\d+$/.test(code)) {
        throw new Error(`Código de pallet inválido: ${code} (debe contener solo dígitos)`);
    }

    return {
        dia_semana: code.slice(0, 1),
        semana: code.slice(1, 3),
        año: `20${code.slice(3, 5)}`,
        horario_proceso: code.slice(5, 6) === "1" ? "Mañana" : "Tarde",
        calibre: code.slice(6, 8),
        formato_caja: code.slice(8, 9),
        contador: code.slice(9, 12),
    };
};

/**
 * Finds a pallet in 'active' state that matches specific box attributes
 */
const findMatchingPallet = async (boxData) => {
    const params = {
        TableName: "Pallets",
        IndexName: "estado-index",  // Query only by estado
        KeyConditionExpression: "#estado = :estado",
        ExpressionAttributeNames: {
            "#estado": "estado"
        },
        ExpressionAttributeValues: {
            ":estado": "open"
        }
    };

    const result = await dynamoDB.query(params).promise();
    console.log(result.Items)
    const match = result.Items.find(p => {
        const { calibre, formato_caja, horario_proceso } = parsePalletCode(p.codigo);
        return (
          p.ubicacion === "PACKING" &&
          calibre === boxData.calibre
        );
      });
      
    if (!match) throw new Error(`No hay pallet para asignar`);
    if (match?.cantidadCajas > 59 ){
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
    
    if (lastProcessed && (now - lastProcessed) < PROCESSING_COOLDOWN) {
      console.log(`⚠️ Duplicate request for box ${code} detected - processed ${now - lastProcessed}ms ago`);
      
      // Instead of rejecting, let's try to get the current state of the box
      try {
        const { Item: existingBox } = await dynamoDB.get({
          TableName: "Huevos",
          Key: { codigo: code }
        }).promise();
        
        if (existingBox) {
          console.log("📦 Box already exists, returning current state:", existingBox);
          return createApiResponse(200, `✅ Caja ya está registrada en el sistema`, existingBox);
        }
      } catch (error) {
        console.error("Error checking for existing box:", error);
        // Continue with normal flow if we couldn't check
      }
    }
    
    // Record this processing attempt
    recentlyProcessedBoxes.set(code, now);
    
    let parsedData, newBox;
  
    // Step 1: Parse the box code
    try {
      parsedData = parseBoxCode(code);
      console.log("📦 Box parsed successfully:", parsedData);
    } catch (parseError) {
      console.error("❌ Error parsing code:", parseError.message);
      return createApiResponse(400, `❌ Código inválido: ${parseError.message}`);
    }
  
    // Step 2: Create newBox object
    newBox = {
      codigo: code,
      ...parsedData,
      palletId: "UNASSIGNED",
      fecha_registro: new Date().toISOString(),
      estado: "PACKING",
      ubicacion: "PACKING",
      ...(scannedCodes && { scannedCodes: JSON.stringify(scannedCodes) })
    };
  
    // Step 3: Save the box to the DB
    try {
      await dynamoDB.put({
        TableName: "Huevos",
        Item: newBox
      }).promise();
      console.log("✅ Caja guardada en DynamoDB:", newBox.codigo);
    } catch (saveError) {
      console.error("❌ Error saving box:", saveError.message);
      return createApiResponse(500, `❌ Error guardando caja: ${saveError.message}`);
    }
    // Step 4: Determine palletCode if not provided 
    if (!palletCode) {
      try {
        const pallet = await findMatchingPallet(newBox);
        palletCode = pallet?.codigo;
        console.log("🔍 Pallet encontrado automáticamente:", palletCode);
        const updatedPallet = await addBoxToPallet(palletCode, newBox.codigo);
        return createApiResponse(200, `✅ Caja asignada al pallet ${updatedPallet.codigo}`, {
                ...newBox,
                palletId: updatedPallet.codigo,
              });
      } catch (matchError) {
        console.warn("⚠️ No matching pallet found:", matchError.message);
        palletCode = null;
        return createApiResponse(400, `⚠️ Caja registrada pero no se encontró pallet compatible`, newBox);
      }
    }
    else{
      try {
        // Verificar si el pallet ya existe para evitar duplicación
        const { Item: existingPallet } = await dynamoDB.get({
          TableName: "Pallets",
          Key: { codigo: palletCode }
        }).promise();
        
        if (existingPallet) {
          // Verificar primero si la caja ya está en el pallet para evitar duplicación
          if (existingPallet.cajas && existingPallet.cajas.includes(newBox.codigo)) {
            // Si la caja ya está en el pallet, solo actualizar la referencia en la caja
            await dynamoDB.update({
              TableName: "Huevos",
              Key: { codigo: newBox.codigo },
              UpdateExpression: 'SET palletId = :palletId',
              ExpressionAttributeValues: {
                ':palletId': palletCode,
              },
            }).promise();
            
            return createApiResponse(200, `✅ Caja ya asignada al pallet ${existingPallet.codigo}`, {
              ...newBox,
              palletId: existingPallet.codigo,
            });
          } else {
            // Si la caja no está en el pallet, proceder con la asignación normal
            const updatedPallet = await addBoxToPallet(palletCode, newBox.codigo);
            return createApiResponse(200, `✅ Caja asignada al pallet ${updatedPallet.codigo}`, {
              ...newBox,
              palletId: updatedPallet.codigo,
            });
          }
        } else {
          // Si el pallet no existe, entonces lo creamos
          const assignedPalletResponse = await createPallet(palletCode, "PACKING");
          const parsed = JSON.parse(assignedPalletResponse.body);
          const assignedPalletCode = parsed?.data?.codigo;
          const updatedPallet = await addBoxToPallet(assignedPalletCode, newBox.codigo);
          return createApiResponse(200, `✅ Caja asignada al pallet ${updatedPallet.codigo}`, {
            ...newBox,
            palletId: updatedPallet.codigo,
          });
        }
      } catch (assignError) {
        console.error("❌ Error assigning pallet:", assignError.message);
        return createApiResponse(400, `❌ Caja registrada pero no pudo ser asignada (asignación fallida): ${assignError.message}`);
      }
    }
    
  
    // Step 6: No pallet available
    return createApiResponse(200, `⚠️ Caja registrada pero no se encontró pallet compatible`, newBox);
  };
  

module.exports = registerEgg;
