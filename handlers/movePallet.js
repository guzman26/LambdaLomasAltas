const databaseService = require('../utils/db');
const createApiResponse = require('../utils/response');

/**
 * Valida si un código tiene el formato correcto para un pallet
 * @param {string} code - Código a validar
 * @returns {boolean} - true si es válido, false si no lo es
 */
const validatePalletCode = code => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // El código del pallet debe tener 12 dígitos
  if (code.length !== 12) {
    return false;
  }

  // Debe contener solo dígitos
  return /^\d+$/.test(code);
};

/**
 * Moves a pallet and all its boxes to a new location
 * @param {string} palletCode - The pallet code
 * @param {string} destination - Destination location (BODEGA, VENTA)
 * @returns {Promise<object>} API response with status and message
 */
const movePallet = async (palletCode, destination) => {
  // Validate pallet code
  if (!validatePalletCode(palletCode)) {
    return createApiResponse(
      400,
      `Código de pallet inválido: ${palletCode}. Debe tener 12 dígitos numéricos.`
    );
  }

  // Validate destination
  const validDestinations = ['TRANSITO', 'BODEGA', 'VENTA'];
  if (!validDestinations.includes(destination)) {
    return createApiResponse(
      400,
      `Destino inválido: ${destination}. Debe ser TRANSITO, BODEGA o VENTA.`
    );
  }

  try {
    // Verificar si el pallet existe
    const pallet = await databaseService.getPalletByCode(palletCode);
    if (!pallet) {
      return createApiResponse(404, `El pallet ${palletCode} no existe en el sistema.`);
    }

    // Verificar que el pallet no esté ya en el destino
    if (pallet.ubicacion === destination) {
      return createApiResponse(400, `El pallet ${palletCode} ya se encuentra en ${destination}.`);
    }

    // Move the pallet with all its boxes
    const result = await databaseService.movePalletWithBoxes(palletCode, destination);

    return createApiResponse(200, {
      message: `Pallet ${palletCode} movido a ${destination} con ${result.boxesUpdated} cajas`,
      boxesUpdated: result.boxesUpdated,
    });
  } catch (error) {
    console.error(`❌ Error moviendo pallet: ${error.message}`, error);
    return createApiResponse(500, `Error al mover pallet: ${error.message}`);
  }
};

module.exports = {
  movePallet,
};
