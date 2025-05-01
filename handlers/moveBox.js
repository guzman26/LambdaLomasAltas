const databaseService = require('../utils/db');
const createApiResponse = require('../utils/response');

/**
 * Valida si un código tiene el formato correcto para una caja
 * @param {string} code - Código a validar
 * @returns {boolean} - true si es válido, false si no lo es
 */
const validateBoxCode = code => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // El código de la caja debe tener 15 dígitos
  if (code.length !== 15) {
    return false;
  }

  // Debe contener solo dígitos
  return /^\d+$/.test(code);
};

/**
 * Moves an egg box from one location to another
 * @param {string} code - Box code
 * @param {string} destination - Destination location
 * @returns {Promise<object>} API response with status and message
 */
const moveEgg = async (code, destination) => {
  // Validar el código de la caja
  if (!validateBoxCode(code)) {
    return createApiResponse(
      400,
      `Código de caja inválido: ${code}. Debe tener 15 dígitos numéricos.`
    );
  }

  // Validar el destino
  const validDestinations = ['PACKING', 'BODEGA', 'VENTA', 'TRANSITO'];
  if (!validDestinations.includes(destination)) {
    return createApiResponse(
      400,
      `Destino inválido: ${destination}. Debe ser PACKING, BODEGA, VENTA o TRANSITO.`
    );
  }

  // Determine current and new states based on destination
  const currentState = destination === 'BODEGA' ? 'PACKING' : 'BODEGA';
  const newState = destination;

  try {
    // Get boxes in the current state with the given code
    const boxes = await databaseService.getEggsByState(code, currentState);

    if (boxes.length === 0) {
      return createApiResponse(
        404,
        `No se encontraron cajas en estado ${currentState} con código ${code}.`
      );
    }

    const selectedBox = boxes[0];

    // Verificar que la caja no esté ya en el destino
    if (selectedBox.ubicacion === destination) {
      return createApiResponse(400, `La caja ${code} ya se encuentra en ${destination}.`);
    }

    // Update egg state and record the movement
    const updatedEgg = await databaseService.updateEggState(
      selectedBox.codigo,
      selectedBox.idCaja,
      newState,
      destination
    );

    return createApiResponse(200, {
      message: `Caja ${selectedBox.idCaja} movida a ${newState}`,
      movementHistory: updatedEgg.historialMovimientos,
    });
  } catch (error) {
    console.error(`❌ Error moviendo caja: ${error.message}`, error);
    return createApiResponse(500, `Error al mover caja: ${error.message}`);
  }
};

module.exports = {
  moveEgg,
};
