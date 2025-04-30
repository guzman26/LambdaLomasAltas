// models/pallets.js
const { dynamoDB, Tables } = require('./index');

const tableName = Tables.Pallets;

/** Parsea un código de pallet de 9 + 3 dígitos */
function parsePalletCode(code) {
  if (!/^\d{12}$/.test(code)) {
    throw new Error(`Código de pallet inválido: ${code}`);
  }
  return {
    dayOfWeek : code.slice(0, 1),
    weekOfYear: code.slice(1, 3),
    year      : code.slice(3, 5),
    shift     : code.slice(5, 6),
    caliber   : code.slice(6, 8),
    format    : code.slice(8, 9),
    suffix    : code.slice(9)      // ### incremental
  };
}

/** Devuelve el siguiente sufijo ### libre para un baseCode dado */
async function nextSuffix(baseCode) {
    const res = await dynamoDB.query({
      TableName: tableName,
      IndexName: 'baseCode-suffix-GSI',
      KeyConditionExpression: 'baseCode = :b',
      ExpressionAttributeValues: { ':b': baseCode },
      ProjectionExpression: 'suffix',
      ScanIndexForward: false,   // orden DESC
      Limit: 1
    }).promise();
  
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
  const parts  = parsePalletCode(codigo);

  const pallet = {
    codigo,
    baseCode,
    suffix,
    fechaCalibreFormato: `${parts.dayOfWeek}${parts.weekOfYear}${parts.year}${parts.shift}${parts.caliber}${parts.format}`,
    estado        : 'open',
    cajas         : [],
    cantidadCajas : 0,
    fechaCreacion : new Date().toISOString(),
    ubicacion
  };

  console.log("Pallet a crear:", tableName, pallet);

  await dynamoDB.put({ TableName: tableName, Item: pallet }).promise();
  return pallet;
}

module.exports = {
  dynamoDB,
  tableName,
  createPallet,
  parsePalletCode
};
