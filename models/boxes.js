const { dynamoDB, Tables } = require('./index');
const { getPalletByCode } = require('./pallets');

// DynamoDB client and table name for Boxes
const tableName = Tables.Boxes;

/**
 * Crear o actualizar un box en DynamoDB
 * @param {Object} boxData - Datos del box a crear
 * @returns {Promise<Object>} Box creado
 */
async function createBox(boxData) {
  if (!boxData.codigo) {
    throw new Error('El código del box es obligatorio');
  }

  // Asegurar que tenemos campos mínimos requeridos
  const box = {
    codigo: boxData.codigo,
    ubicacion: boxData.ubicacion || 'PACKING',
    timestamp: boxData.timestamp || new Date().toISOString(),
    ...boxData,
  };

  const params = {
    TableName: tableName,
    Item: box,
    ReturnValues: 'ALL_OLD',
  };

  try {
    await dynamoDB.put(params).promise();
    console.log(`Box creado/actualizado: ${box.codigo}`);
    return box;
  } catch (error) {
    console.error(`Error al crear/actualizar box ${box.codigo}:`, error);
    throw new Error(`Error al crear/actualizar box: ${error.message}`);
  }
}

/**
 * Obtener un box por su código
 * @param {string} codigo - Código del box
 * @returns {Promise<Object|null>} Box encontrado o null si no existe
 */
async function getBoxByCode(codigo) {
  const params = {
    TableName: tableName,
    Key: { codigo },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  } catch (error) {
    console.error(`Error al obtener box ${codigo}:`, error);
    throw new Error(`Error al obtener box: ${error.message}`);
  }
}

/**
 * Actualizar propiedades específicas de un box
 * @param {string} codigo - Código del box
 * @param {Object} updates - Propiedades a actualizar
 * @returns {Promise<Object>} Box actualizado
 */
async function updateBox(codigo, updates) {
  // Comprobar que el box existe primero
  const existingBox = await getBoxByCode(codigo);
  if (!existingBox) {
    throw new Error(`Box con código ${codigo} no encontrado`);
  }

  // Construir expresiones de actualización dinámica
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  // Prohibir actualizar el código (clave primaria)
  const excludedFields = ['codigo'];

  Object.entries(updates).forEach(([key, value]) => {
    if (!excludedFields.includes(key)) {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    }
  });

  // Añadir timestamp de actualización
  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  if (updateExpressions.length === 0) {
    return existingBox; // Nada que actualizar
  }

  const params = {
    TableName: tableName,
    Key: { codigo },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await dynamoDB.update(params).promise();
    console.log(`Box actualizado: ${codigo}`);
    return result.Attributes;
  } catch (error) {
    console.error(`Error al actualizar box ${codigo}:`, error);
    throw new Error(`Error al actualizar box: ${error.message}`);
  }
}

/**
 * Eliminar un box por su código
 * @param {string} codigo - Código del box
 * @returns {Promise<boolean>} true si se eliminó, false si no existía
 */
async function deleteBox(codigo) {
  const params = {
    TableName: tableName,
    Key: { codigo },
    ReturnValues: 'ALL_OLD',
  };

  try {
    const result = await dynamoDB.delete(params).promise();
    const deleted = !!result.Attributes;
    console.log(`Box ${deleted ? 'eliminado' : 'no encontrado'}: ${codigo}`);
    return deleted;
  } catch (error) {
    console.error(`Error al eliminar box ${codigo}:`, error);
    throw new Error(`Error al eliminar box: ${error.message}`);
  }
}

/**
 * Listar boxes por ubicación
 * @param {string} ubicacion - Ubicación a filtrar (PACKING, BODEGA, VENTA, etc)
 * @returns {Promise<Array<Object>>} Lista de boxes en esa ubicación
 */
async function getBoxesByLocation(ubicacion) {
  const params = {
    TableName: tableName,
    IndexName: 'ubicacion-index',
    KeyConditionExpression: '#ubicacion = :ubicacionValue',
    ExpressionAttributeNames: {
      '#ubicacion': 'ubicacion',
    },
    ExpressionAttributeValues: {
      ':ubicacionValue': ubicacion,
    },
  };

  try {
    const result = await dynamoDB.query(params).promise();
    console.log(`Boxes encontrados en ${ubicacion}: ${result.Items.length}`);
    return result.Items;
  } catch (error) {
    console.error(`Error al listar boxes en ubicación ${ubicacion}:`, error);
    throw new Error(`Error al listar boxes por ubicación: ${error.message}`);
  }
}

/**
 * Buscar boxes por palletId
 * @param {string} palletId - ID del pallet
 * @returns {Promise<Array<Object>>} Lista de boxes en ese pallet
 */
async function getBoxesByPallet(palletId) {
  try {
    const params = {
      TableName: tableName,
      IndexName: 'palletId-index',
      KeyConditionExpression: 'palletId = :palletId',
      ExpressionAttributeValues: {
        ':palletId': palletId,
      },
    };
    const result = await dynamoDB.query(params).promise();
    console.log(`Boxes encontrados en pallet ${palletId}: ${result.Items.length}`);
    return result.Items;
  } catch (error) {
    console.error(`Error al listar boxes en pallet ${palletId}:`, error);
    throw new Error(`Error al listar boxes por pallet: ${error.message}`);
  }
}

/**
 * Mover un box a una nueva ubicación
 * @param {string} codigo - Código del box
 * @param {string} nuevaUbicacion - Nueva ubicación del box
 * @returns {Promise<Object>} Box actualizado
 */
async function moveBox(codigo, nuevaUbicacion) {
  return updateBox(codigo, { ubicacion: nuevaUbicacion });
}

/**
 * Asignar un box a un pallet
 * @param {string} codigo - Código del box
 * @param {string} palletId - ID del pallet
 * @returns {Promise<Object>} Box actualizado
 */
async function assignBoxToPallet(codigo, palletId) {
  return updateBox(codigo, { palletId });
}

/**
 * Contar boxes por ubicación
 * @returns {Promise<Object>} Conteo de boxes por ubicación
 */
async function countBoxesByLocation() {
  const ubicaciones = ['PACKING', 'BODEGA', 'VENTA'];
  const counts = {};

  for (const u of ubicaciones) {
    const res = await dynamoDB
      .query({
        TableName: tableName,
        IndexName: 'ubicacion-index',
        KeyConditionExpression: 'ubicacion = :u',
        ExpressionAttributeValues: { ':u': u },
        Select: 'COUNT',
      })
      .promise();
    counts[u] = res.Count; // res.Count devuelve el total sin traer Items
  }
  return counts;
}

/**
 * Verificar si un código de box existe
 * @param {string} codigo - Código a verificar
 * @returns {Promise<boolean>} true si existe, false si no
 */
async function boxExists(codigo) {
  try {
    const box = await getBoxByCode(codigo);
    return !!box;
  } catch (error) {
    console.error(`Error al verificar existencia de box ${codigo}:`, error);
    throw new Error(`Error al verificar existencia de box: ${error.message}`);
  }
}

async function deleteBoxCascade(codigo) {
  // 1️⃣  Obtener la caja
  const box = await getBoxByCode(codigo);
  if (!box) {
    return { success: false, message: `La caja ${codigo} no existe` };
  }

  // 2️⃣  Si tiene pallet, actualizarlo
  if (box.palletId) {
    const pallet = await getPalletByCode(box.palletId);
    if (pallet) {
      const nuevasCajas = (pallet.cajas || []).filter(id => id !== codigo);
      await updatePalletBoxes(pallet.codigo, nuevasCajas);
    }
  }

  // 3️⃣  Borrar la caja
  await dynamoDB.delete({ TableName: tableName, Key: { codigo } }).promise();
  return { success: true, message: `Caja ${codigo} eliminada con éxito` };
}

/** Actualiza array cajas y cantidadCajas de un pallet (útil para otros flujos) */
async function updatePalletBoxes(palletId, cajas) {
  await dynamoDB
    .update({
      TableName: Tables.Pallets,
      Key: { codigo: palletId },
      UpdateExpression: 'SET cajas = :c, cantidadCajas = :n',
      ExpressionAttributeValues: {
        ':c': cajas,
        ':n': cajas.length,
      },
    })
    .promise();
}

async function findBoxesWithoutPallet() {
  const params = {
    TableName: tableName,
    IndexName: 'palletId-index',
    KeyConditionExpression: 'palletId = :u',
    ExpressionAttributeValues: { ':u': 'UNASSIGNED' },
  };

  const results = [];
  let lastKey;

  do {
    const { Items, LastEvaluatedKey } = await dynamoDB
      .query({ ...params, ExclusiveStartKey: lastKey })
      .promise();

    results.push(...Items);
    lastKey = LastEvaluatedKey;
  } while (lastKey);

  return results;
}

async function getUnassignedBoxesInPacking () {
  const params = {
    TableName: tableName,
    IndexName: 'ubicacion-index',
    KeyConditionExpression: '#u = :packing',
    FilterExpression: 'attribute_not_exists(palletId) OR palletId = :un',
    ExpressionAttributeNames: { '#u': 'ubicacion' },
    ExpressionAttributeValues: {
      ':packing': 'PACKING',
      ':un'     : 'UNASSIGNED'
    }
  };

  const items = [];
  let lastKey;

  do {
    const res = await dynamoDB
      .query({ ...params, ExclusiveStartKey: lastKey })
      .promise();

    items.push(...res.Items);
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return items;
}


module.exports = {
  dynamoDB,
  tableName,
  createBox,
  getBoxByCode,
  updateBox,
  deleteBox,
  getBoxesByLocation,
  getBoxesByPallet,
  moveBox,
  assignBoxToPallet,
  countBoxesByLocation,
  boxExists,
  deleteBoxCascade,
  updatePalletBoxes,
  findBoxesWithoutPallet,
  getUnassignedBoxesInPacking,
};
