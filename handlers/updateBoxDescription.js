/* eslint-disable consistent-return */
const createApiResponse = require('../utils/response');
const { updateBox } = require('../models/boxes'); // ← usa el modelo, no DynamoDB directo

/**
 * Actualiza (o crea) la descripción libre que tiene una caja.
 *
 * @param {string} codigo         – Código de la caja (PK, 15 dígitos)
 * @param {string} newDescription – Texto libre que el usuario escribió
 * @returns {Promise<object>}     – Respuesta API uniforme
 */
const updateBoxDescription = async (codigo, newDescription) => {
  /* 1️⃣  Validaciones de entrada ------------------------------------------------ */
  if (!codigo || typeof codigo !== 'string')
    return createApiResponse(400, '❌ El código de la caja es obligatorio');

  if (typeof newDescription !== 'string' || newDescription.trim() === '')
    return createApiResponse(400, '❌ La descripción debe ser un texto no vacío');

  /* 2️⃣  Persistir usando la capa de modelo ------------------------------------ */
  try {
    const updated = await updateBox(codigo, { descripcion: newDescription.trim() });

    return createApiResponse(200, '✅ Descripción actualizada correctamente', updated);
  } catch (err) {
    console.error('❌ Error al actualizar descripción:', err);
    const status = /no encontrado/i.test(err.message) ? 404 : 500;
    return createApiResponse(status, `❌ ${err.message}`);
  }
};

module.exports = updateBoxDescription;
