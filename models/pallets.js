// models/pallets.js
const { dynamoDB, Tables } = require('./index');
const { getBoxByCode, assignBoxToPallet } = require('./boxes');

const tableName = Tables.Pallets;

/** Parsea un código de pallet de 9 + 3 dígitos */
function parsePalletCode(code) {
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
}

/** Devuelve el siguiente sufijo ### libre para un baseCode dado */
async function nextSuffix(baseCode) {
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
}

/** Crea un pallet y lo devuelve  */
async function createPallet(baseCode, ubicacion = 'PACKING') {
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
}

async function getPallets({ estado, ubicacion, fechaDesde, fechaHasta } = {}) {
  // 1) Por ESTADO
  if (estado) {
    const params = {
      TableName: tableName,
      IndexName: 'estado-fechaCreacion-GSI',
      KeyConditionExpression:
        '#e = :e' + (fechaDesde && fechaHasta ? ' AND #f BETWEEN :d AND :h' : ''),
      ExpressionAttributeNames: { '#e': 'estado', '#f': 'fechaCreacion' },
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
  throw new Error('Debes proporcionar al menos un filtro (estado o ubicacion)');
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

  if (cerrar && (!Array.isArray(pallet.cajas) || pallet.cajas.length === 0)) {
    throw new Error(`Pallet ${codigo} no tiene cajas; no se puede cerrar`);
  }

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

async function addBoxToPallet(palletId, boxCode) {
    // 1) Obtener pallet
    const pallet = await getPalletByCode(palletId);
    if (!pallet) throw new Error(`Pallet "${palletId}" no encontrado`);
    if (pallet.estado !== 'open') throw new Error(`Pallet "${palletId}" no está abierto`);
    if ((pallet.cantidadCajas || 0) >= 60) throw new Error(`Pallet "${palletId}" está lleno`);
  
    // 2) Obtener box
    const box = await getBoxByCode(boxCode);
    if (!box) throw new Error(`Box "${boxCode}" no existe`);
  
    // 3) Validar compatibilidad calibre / formato / fecha
    const p = parsePalletCode(pallet.codigo);          // usa función existente
    const pDateIso = `${'20' + p.year}-W${p.weekOfYear}-${p.dayOfWeek}`;
  
    const boxDate = new Date(box.fecha_registro);
    const boxWeek = getISOWeek(boxDate);
    const boxDay  = String(boxDate.getUTCDay());
    const boxDateIso = `${boxDate.getUTCFullYear()}-W${String(boxWeek).padStart(2,'0')}-${boxDay}`;
  
    if (p.caliber !== box.calibre)        throw new Error('Calibre no coincide');
    if (p.format  !== box.formato_caja)   throw new Error('Formato no coincide');
    if (pDateIso  !== boxDateIso)         throw new Error('Fecha no coincide');
  
    // 4) Actualizar pallet (evita duplicados)
    const upd = await dynamoDB.update({
      TableName: tableName,
      Key: { codigo: palletId },
      UpdateExpression:
        'SET cajas = list_append(if_not_exists(cajas,:e), :nuevo), cantidadCajas = cantidadCajas + :inc',
      ConditionExpression: 'attribute_not_exists(cajas) OR NOT contains(cajas, :dup)',
      ExpressionAttributeValues: {
        ':nuevo': [boxCode],
        ':e': [],
        ':inc': 1,
        ':dup': boxCode
      },
      ReturnValues: 'ALL_NEW'
    }).promise().catch(async err => {
      if (err.code === 'ConditionalCheckFailedException') {
        // ya estaba dentro → obtener estado actual
        const { Item } = await dynamoDB.get({ TableName: tableName, Key: { codigo: palletId }}).promise();
        return { Attributes: Item };
      }
      throw err;
    });
  
    // 5) Actualizar la caja con el palletId
    await assignBoxToPallet(boxCode, palletId);
  
    return upd.Attributes;
  }
  
  /** Devuelve semana ISO */
  function getISOWeek(d){
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(),0,1));
    return Math.ceil(((t - yearStart) / 86400000 + 1)/7);
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
};
