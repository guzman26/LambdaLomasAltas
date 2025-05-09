// admin/getSystemDashboard.js (fragmento)
const { dynamoDB, Tables } = require('../../models/index');
const BOXES   = Tables.Boxes;
const PALLETS = Tables.Pallets;
const ISSUES  = Tables.Issues;


async function _countBoxesByUbicacion(ubicacion) {
  const { Count } = await dynamoDB.query({
    TableName: BOXES,
    IndexName: 'ubicacion-index',          // PK = ubicacion
    KeyConditionExpression: '#u = :u',
    ExpressionAttributeNames : { '#u': 'ubicacion' },
    ExpressionAttributeValues: { ':u': ubicacion.toUpperCase() },
    Select: 'COUNT',
  }).promise();
  return Count;
}

async function _countAllPallets() {
  /* Usamos el GSI estado‑fechaCreacion‑GSI sólo para contar,
     partición 'open' + 'closed'. */
  const estados = ['open', 'closed'];
  let total = 0;
  for (const e of estados) {
    const { Count } = await dynamoDB.query({
      TableName: PALLETS,
      IndexName: 'estado-fechaCreacion-GSI',
      KeyConditionExpression: '#e = :e',
      ExpressionAttributeNames : { '#e': 'estado' },
      ExpressionAttributeValues: { ':e': e },
      Select: 'COUNT',
    }).promise();
    total += Count;
  }
  return total;
}

async function _countPendingIssues() {
  const { Count } = await dynamoDB.query({
    TableName: ISSUES,
    IndexName: 'estado-timestamp-GSI',     // PK = estado
    KeyConditionExpression: '#s = :p',
    ExpressionAttributeNames : { '#s': 'estado' },
    ExpressionAttributeValues: { ':p': 'PENDING' },
    Select: 'COUNT',
  }).promise();
  return Count;
}

async function _getActivePallet() {
    const { Count } = await dynamoDB.query({
        TableName: PALLETS,
        IndexName: 'estado-index',     // PK = estado
        KeyConditionExpression: '#s = :p',
        ExpressionAttributeNames : { '#s': 'estado' },
        ExpressionAttributeValues: { ':p':'open' },
        Select: 'COUNT',
      }).promise();
      return Count;
}

exports.getSystemDashboard = async () => {
  try {
    const [
      packing,
      bodega,
      venta,
      transito,
      pallets,
      pendingIssues,
      activePallet,
    ] = await Promise.all([
      _countBoxesByUbicacion('PACKING'),
      _countBoxesByUbicacion('BODEGA'),
      _countBoxesByUbicacion('VENTA'),
      _countBoxesByUbicacion('TRANSITO'),
      _countAllPallets(),
      _countPendingIssues(),
      _getActivePallet(),
    ]);

    return {
      stats : {
        huevos_en_packing: packing,
        huevos_en_bodega : bodega,
        huevos_en_venta  : venta,
        huevos_en_transito: transito,
        total_pallets    : pallets,
        issues_pendientes: pendingIssues,
        pallets_activos: activePallet,
      },
      config: { pallets_activos: activePallet },
    };
  } catch (err) {
    throw new Error(`Dashboard error: ${err.message}`);
  }
};
