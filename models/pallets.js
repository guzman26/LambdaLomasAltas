// models/pallets.js
const { dynamoDB, Tables } = require('./index');
const { handleDynamoDBError, validateRequiredParams } = require('../utils/dynamoErrors');

const tableName = Tables.Pallets;

/** Parsea un código de pallet de 9 + 3 dígitos */
function parsePalletCode(code) {
  try {
    validateRequiredParams({ code }, ['code']);

    if (!/^\d{12}$/.test(code)) {
      throw new Error(`Código de pallet inválido: ${code}`);
    }

    return {
      dayOfWeek: code.slice(0, 1),
      weekOfYear: code.slice(1, 3),
      year: code.slice(3, 5),
      shift: code.slice(5, 6),
      caliber: code.slice(6, 8),
      format: code.slice(8, 9),
      suffix: code.slice(9), // ### incremental
    };
  } catch (error) {
    if (error.message.includes('Parámetros requeridos')) {
      throw error;
    }
    throw new Error(`Error al parsear código de pallet: ${error.message}`);
  }
}

/** Devuelve el siguiente sufijo ### libre para un baseCode dado */
async function nextSuffix(baseCode) {
  try {
    validateRequiredParams({ baseCode }, ['baseCode']);

    const res = await dynamoDB
      .query({
        TableName: tableName,
        IndexName: 'baseCode-suffix-GSI',
        KeyConditionExpression: 'baseCode = :b',
        ExpressionAttributeValues: { ':b': baseCode },
        ProjectionExpression: 'suffix',
        ScanIndexForward: false, // orden DESC
        Limit: 1,
      })
      .promise();

    const max = res.Count === 0 ? 0 : Number(res.Items[0].suffix);
    return String(max + 1).padStart(3, '0');
  } catch (error) {
    throw handleDynamoDBError(error, 'calcular', 'siguiente sufijo', baseCode);
  }
}

/** Crea un pallet y lo devuelve  */
async function createPallet(baseCode, ubicacion = 'PACKING') {
  try {
    validateRequiredParams({ baseCode }, ['baseCode']);

    if (!/^\d{9}$/.test(baseCode)) {
      throw new Error('baseCode debe ser string de 9 dígitos');
    }

    const suffix = await nextSuffix(baseCode);
    const codigo = `${baseCode}${suffix}`;
    const parts = parsePalletCode(codigo);

    const pallet = {
      codigo,
      baseCode,
      suffix,
      pkFecha: 'FECHA',
      fechaCalibreFormato: `${parts.dayOfWeek}${parts.weekOfYear}${parts.year}${parts.shift}${parts.caliber}${parts.format}`,
      estado: 'open',
      cajas: [],
      cantidadCajas: 0,
      fechaCreacion: new Date().toISOString(),
      ubicacion,
    };

    console.log('Pallet a crear:', tableName, pallet);

    await dynamoDB.put({ TableName: tableName, Item: pallet }).promise();
    return pallet;
  } catch (error) {
    throw handleDynamoDBError(error, 'crear', 'pallet', baseCode);
  }
}

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

async function getPallets({ estado, ubicacion, fechaDesde, fechaHasta } = {}) {
  // 1) Por ESTADO
  if (estado) {
    const params = {
      TableName: tableName,
      IndexName: 'estado-fechaCreacion-GSI',
      KeyConditionExpression:
        '#e = :e' + (fechaDesde && fechaHasta ? ' AND #f BETWEEN :d AND :h' : ''),
      ExpressionAttributeNames:
        fechaDesde && fechaHasta ? { '#e': 'estado', '#f': 'fechaCreacion' } : { '#e': 'estado' },
      ExpressionAttributeValues: {
        ':e': estado,
        ...(fechaDesde && fechaHasta && { ':d': fechaDesde, ':h': fechaHasta }),
      },
      ScanIndexForward: false, // últimos primero
    };
    const res = await dynamoDB.query(params).promise();
    return res.Items;
  }

  // 2) Por UBICACION
  if (ubicacion) {
    const params = {
      TableName: tableName,
      IndexName: 'ubicacion-fechaCreacion-GSI',
      KeyConditionExpression: '#u = :u',
      ExpressionAttributeNames: { '#u': 'ubicacion' },
      ExpressionAttributeValues: { ':u': ubicacion },
      ScanIndexForward: false,
    };
    const res = await dynamoDB.query(params).promise();
    return res.Items;
  }

  // 3) Sin filtros → no permitimos Scan
  /* ───────────────── 3) Fallback → últimos 5 días ──────────── */
  const ahora = new Date();
  const desde = new Date(ahora.getTime() - TEN_DAYS_MS).toISOString();
  const hasta = ahora.toISOString();

  const params = {
    TableName: tableName,
    IndexName: 'fechaCreacion-index', // PK = pkFecha, SK = fechaCreacion
    KeyConditionExpression: 'pkFecha = :pk AND fechaCreacion BETWEEN :d AND :h',
    ExpressionAttributeValues: {
      ':pk': 'FECHA', // valor fijo que colocas al insertar/actualizar el pallet
      ':d': desde,
      ':h': hasta,
    },
    ScanIndexForward: false,
  };

  const pallets = [];
  let lastKey;

  do {
    const res = await dynamoDB.query({ ...params, ExclusiveStartKey: lastKey }).promise();
    pallets.push(...res.Items);
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return pallets;
}

/**
 * Cambia el estado de un pallet:
 *  • Si está 'open'  → lo pasa a 'closed'
 *  • Si está 'closed'→ lo re-abre a 'open'
 * Valida que exista y que tenga al menos 1 caja antes de cerrarlo.
 * @param {string} codigo
 * @returns {Promise<Object>} pallet actualizado
 */
async function togglePalletStatus(codigo) {
  if (!codigo) throw new Error('codigo es requerido');

  // 1. Leer el pallet
  const res = await dynamoDB
    .get({
      TableName: tableName,
      Key: { codigo },
    })
    .promise();

  const pallet = res.Item;
  if (!pallet) throw new Error(`Pallet ${codigo} no encontrado`);

  const estadoActual = pallet.estado || 'open';
  const cerrar = estadoActual === 'open';

  const nuevoEstado = cerrar ? 'closed' : 'open';

  // 2. Update
  const upd = await dynamoDB
    .update({
      TableName: tableName,
      Key: { codigo },
      UpdateExpression: 'SET estado = :e',
      ExpressionAttributeValues: { ':e': nuevoEstado },
      ReturnValues: 'ALL_NEW',
    })
    .promise();

  return upd.Attributes;
}

/**
 * Atajo sólo-cerrar. Devuelve error si ya estaba cerrado.
 */
async function closePallet(codigo) {
  const pallet = await togglePalletStatus(codigo);
  if (pallet.estado !== 'closed') {
    throw new Error(`Pallet ${codigo} ya estaba cerrado`);
  }
  return pallet;
}

async function getOpenPallets() {
  const params = {
    TableName: tableName,
    IndexName: 'estado-fechaCreacion-GSI', // ya existe
    KeyConditionExpression: '#e = :open',
    ExpressionAttributeNames: { '#e': 'estado' },
    ExpressionAttributeValues: { ':open': 'open' },
    ScanIndexForward: false, // más recientes primero
  };

  const res = await dynamoDB.query(params).promise();
  return res.Items;
}

async function getPalletByCode(codigo) {
  const res = await dynamoDB
    .get({
      TableName: tableName,
      Key: { codigo },
    })
    .promise();
  return res.Item || null;
}

async function getOrCreatePallet(codigo, ubicacion = 'PACKING') {
  let pallet = await getPalletByCode(codigo);
  if (!pallet) {
    pallet = await createPallet(codigo, ubicacion); // reutiliza tu función existente
  }
  return pallet;
}

/**
 * Añade una caja a un pallet
 * @param {string} palletId - Código del pallet
 * @param {string} boxCode - Código de la caja a añadir
 * @returns {Promise<Object>} Pallet actualizado
 */
async function addBoxToPallet(palletId, boxCode) {
  try {
    validateRequiredParams({ palletId, boxCode }, ['palletId', 'boxCode']);

    // 1. Verificar que el pallet existe
    const pallet = await getPalletByCode(palletId);

    if (!pallet) {
      throw new Error(`Pallet ${palletId} no encontrado`);
    }

    // 2. Comprobar que el pallet no está cerrado
    if (pallet.estado === 'closed') {
      throw new Error(`No se pueden añadir cajas al pallet ${palletId} porque está cerrado`);
    }

    // 3. Verificar que la caja existe
    const { getBoxByCode } = require('./boxes');
    const box = await getBoxByCode(boxCode);

    if (!box) {
      throw new Error(`Caja ${boxCode} no encontrada`);
    }

    // 4. Validar que la caja no está ya en otro pallet
    if (box.palletId && box.palletId !== palletId) {
      throw new Error(
        `La caja ${boxCode} ya está asignada al pallet ${box.palletId}. Desasígnela primero.`
      );
    }

    // 5. Validar que la caja está en PACKING (solo se pueden asignar desde PACKING)
    if (box.ubicacion !== 'PACKING') {
      throw new Error(
        `La caja ${boxCode} está en ${box.ubicacion}, no en PACKING. Solo se pueden asignar cajas desde PACKING.`
      );
    }

    // 6. Actualizar la caja con el palletId
    await dynamoDB
      .update({
        TableName: Tables.Boxes,
        Key: { codigo: boxCode },
        UpdateExpression: 'SET palletId = :p',
        ExpressionAttributeValues: { ':p': palletId },
      })
      .promise();

    // 7. Actualizar el pallet - añadimos la caja a la lista y actualizamos conteo
    const cajas = [...(pallet.cajas || [])];
    // Solo añadimos si no está ya
    if (!cajas.includes(boxCode)) {
      cajas.push(boxCode);
    }

    const palletUpdated = await dynamoDB
      .update({
        TableName: tableName,
        Key: { codigo: palletId },
        UpdateExpression: 'SET cajas = :c, cantidadCajas = :n',
        ExpressionAttributeValues: {
          ':c': cajas,
          ':n': cajas.length,
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();

    return palletUpdated.Attributes;
  } catch (error) {
    // Si es un error ya formateado, lo pasamos directamente
    if (
      error.message &&
      (error.message.includes('no encontrado') ||
        error.message.includes('cerrado') ||
        error.message.includes('ya está asignada') ||
        error.message.includes('Solo se pueden asignar'))
    ) {
      throw error;
    }
    throw handleDynamoDBError(error, 'asignar', 'caja a pallet', `${boxCode} a ${palletId}`);
  }
}

/** Devuelve semana ISO */
function getISOWeek(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
}

async function deletePalletCascade(codigo) {
  /* 1️⃣  Leer pallet */
  const { Item: pallet } = await dynamoDB
    .get({
      TableName: tableName,
      Key: { codigo },
    })
    .promise();

  if (!pallet) return { success: false, message: `El pallet ${codigo} no existe` };

  /* 2️⃣  Preparar TransactWriteItems ------------------------------ */
  const tx = { TransactItems: [] };

  // 2.1 – eliminar pallet
  tx.TransactItems.push({
    Delete: { TableName: tableName, Key: { codigo } },
  });

  // 2.2 – para cada caja, borrar atributo palletId (si existía)
  (pallet.cajas || []).forEach(boxCode => {
    tx.TransactItems.push({
      Update: {
        TableName: BOX_TABLE,
        Key: { codigo: boxCode },
        UpdateExpression: 'REMOVE palletId',
        ConditionExpression: 'attribute_exists(codigo)',
      },
    });
  });

  /* 3️⃣  Ejecutar transacción */
  await dynamoDB.transactWrite(tx).promise();

  return {
    success: true,
    message: `Pallet ${codigo} eliminado y ${tx.TransactItems.length - 1} cajas actualizadas`,
    data: { codigo, cajasAfectadas: (pallet.cajas || []).length },
  };
}

/* ─────── helpers internos ───────────────────────────────────────── */
async function _chunkedTransactWrite(items) {
  const chunks = [];
  for (let i = 0; i < items.length; i += 25) chunks.push(items.slice(i, i + 25));

  for (const chunk of chunks) {
    await dynamoDB.transactWrite({ TransactItems: chunk }).promise();
  }
}

/* ─────── Mover pallet + cajas ───────────────────────────────────── */
/**
 * Cambia la ubicación de un pallet y de TODAS sus cajas.
 * @param {string} codigoPallet
 * @param {string} destino       'TRANSITO' | 'BODEGA' | 'VENTA'
 * @returns {{ boxesUpdated: number }}
 */
async function movePalletWithBoxes(codigoPallet, destino) {
  const pallet = await getPalletByCode(codigoPallet);
  if (!pallet) throw new Error(`Pallet ${codigoPallet} no existe`);
  if (pallet.ubicacion === destino) throw new Error(`El pallet ya está en ${destino}`);

  /* 1️⃣  Primer bloque de la transacción: actualizar pallet */
  const txItems = [
    {
      Update: {
        TableName: tableName,
        Key: { codigo: codigoPallet },
        UpdateExpression: 'SET ubicacion = :u',
        ExpressionAttributeValues: { ':u': destino },
      },
    },
  ];

  /* 2️⃣  Añadir update de cada caja (quitar palletId si va a TRANSITO) */
  const cajas = pallet.cajas || [];
  cajas.forEach(codigoBox => {
    const UpdateExpression =
      destino === 'TRANSITO'
        ? 'SET ubicacion = :u REMOVE palletId' // se "desengancha"
        : 'SET ubicacion = :u';

    txItems.push({
      Update: {
        TableName: Tables.Boxes,
        Key: { codigo: codigoBox },
        UpdateExpression,
        ExpressionAttributeValues: { ':u': destino },
      },
    });
  });

  /* 3️⃣  Ejecutar en bloques de 25 */
  await _chunkedTransactWrite(txItems);

  return { boxesUpdated: cajas.length };
}

module.exports = {
  dynamoDB,
  tableName,
  createPallet,
  parsePalletCode,
  getPallets,
  togglePalletStatus,
  closePallet,
  getOpenPallets,
  getOrCreatePallet,
  getPalletByCode,
  addBoxToPallet,
  deletePalletCascade,
  movePalletWithBoxes,
};
