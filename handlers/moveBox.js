/* handlers/moveBox.js */
const {
  getBoxByCode,
  moveBox, // update ubicacion
} = require('../models/boxes');
const { recordMovement } = require('../models/movementHistory');
const createApiResponse = require('../utils/response');
const { addBoxToPallet } = require('../models/pallets');
const { validateRequiredParams } = require('../utils/dynamoErrors');
const { registerMovement } = require('../models/movementHistory');

/* ───────────────── helpers ───────────────── */
const VALID_DESTS = ['PACKING', 'BODEGA', 'VENTA', 'TRANSITO'];

const isValidBoxCode = code => /^\d{15}$/.test(code);

/* ───────────────── handler ───────────────── */
const moveEgg = async (codigo, destino) => {
  /* 1) Validaciones básicas */
  if (!isValidBoxCode(codigo)) {
    return createApiResponse(
      400,
      `Código de caja inválido: ${codigo}. Debe tener 15 dígitos numéricos.`
    );
  }

  if (!VALID_DESTS.includes(destino)) {
    return createApiResponse(
      400,
      `Destino inválido: ${destino}. Debe ser PACKING, BODEGA, VENTA o TRANSITO.`
    );
  }

  try {
    /* 2) Recuperar la caja */
    const box = await getBoxByCode(codigo);
    if (!box) {
      return createApiResponse(404, `Caja ${codigo} no encontrada`);
    }

    if (box.ubicacion === destino) {
      return createApiResponse(400, `La caja ${codigo} ya se encuentra en ${destino}.`);
    }

    const fromLocation = box.ubicacion;

    /* 3) Actualizar ubicación mediante el modelo */
    const updated = await moveBox(codigo, destino);

    /* 4) Registrar el movimiento en el historial */
    await recordMovement(codigo, 'BOX', fromLocation, destino);

    return createApiResponse(200, `Caja ${codigo} movida a ${destino}`, updated);
  } catch (err) {
    console.error('❌ Error moviendo caja:', err);
    return createApiResponse(500, `Error al mover caja: ${err.message}`);
  }
};

/**
 * Handler para mover una caja a una nueva ubicación y opcionalmente asignarla a un pallet
 */
module.exports = async event => {
  try {
    // Parse body
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (error) {
      return createApiResponse(400, 'Error al procesar el cuerpo de la solicitud. El formato JSON es inválido.');
    }

    const { codigo, destino, palletId } = body || {};
    
    // Validate required parameters
    try {
      validateRequiredParams({ codigo, destino }, ['codigo', 'destino']);
    } catch (error) {
      return createApiResponse(400, error.message);
    }

    // Validate destination
    const validDestinations = ['PACKING', 'BODEGA', 'VENTA', 'TRANSITO'];
    if (!validDestinations.includes(destino)) {
      return createApiResponse(
        400,
        `El destino '${destino}' no es válido. Valores permitidos: ${validDestinations.join(', ')}`
      );
    }

    // Process movement
    let result;
    let message = `✅ Caja movida a ${destino}`;

    // 1. Move box to new location
    result = await moveBox(codigo, destino);

    // 2. If palletId is provided, assign box to pallet
    if (palletId && destino === 'PACKING') {
      try {
        result = await addBoxToPallet(palletId, codigo);
        message = `✅ Caja movida a ${destino} y asignada al pallet ${palletId}`;
      } catch (palletError) {
        // If assignment to pallet fails, log the error but don't fail the entire operation
        console.error(`❌ Error al asignar caja ${codigo} al pallet ${palletId}:`, palletError);
        message += `. ⚠️ No se pudo asignar al pallet: ${palletError.message}`;
      }
    }

    // 3. Register the movement in history
    try {
      await registerMovement({
        codigo,
        itemType: 'BOX',
        destino,
        usuario: event.requestContext?.authorizer?.claims?.email || 'sistema',
        timestamp: new Date().toISOString(),
        metadata: { palletId }
      });
    } catch (historyError) {
      console.error(`❌ Error al registrar movimiento para caja ${codigo}:`, historyError);
      // Don't fail the operation if history registration fails
    }

    return createApiResponse(200, message, result);
  } catch (error) {
    console.error('❌ Error en moveBox handler:', error);
    return createApiResponse(
      error.message.includes('no encontrado') ? 404 : 500,
      `❌ ${error.message}`
    );
  }
};
