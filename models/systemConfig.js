/**
 * ────────────────────────────────────────────────────────────────────────────
 *  System‑wide configuration (key → value) stored in DynamoDB
 *  – 100 % aligned with the rest of your model layer (no raw AWS client here)
 * ────────────────────────────────────────────────────────────────────────────
 */
const { dynamoDB, Tables } = require('./index');

const tableName = Tables.SystemConfig; // ← viene de tu archivo index.js

/* ─────────────── CRUD ──────────────────────────────────────────────────── */

/**
 * Persiste un par clave / valor
 * @param {string}  configKey
 * @param {any}     configValue  (se guarda tal cual en DynamoDB)
 */
async function setSystemConfig(configKey, configValue) {
  if (!configKey) throw new Error('configKey es obligatorio');

  await dynamoDB
    .put({
      TableName: tableName,
      Item: { configKey, configValue },
    })
    .promise();

  console.log('[SystemConfig] ✅ Guardado', configKey);
}

/**
 * Obtiene el valor almacenado para una clave; `null` si no existe
 * @param   {string} configKey
 * @returns {Promise<any|null>}
 */
async function getSystemConfig(configKey) {
  if (!configKey) throw new Error('configKey es obligatorio');

  const { Item } = await dynamoDB
    .get({
      TableName: tableName,
      Key: { configKey },
    })
    .promise();

  return Item ? Item.configValue : null;
}

/* ─────────────── exports ──────────────────────────────────────────────── */
module.exports = {
  dynamoDB, // re‑export por consistencia con demás modelos
  tableName,
  setSystemConfig,
  getSystemConfig,
};
