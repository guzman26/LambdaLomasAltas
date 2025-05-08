const { getBoxesByLocation } = require('../models/boxes');
const response = require('../utils/response');

module.exports = async () => {
  try {
    // ── 1. Ejecutamos ambas consultas al mismo tiempo ────────────────
    const [packing, transito] = await Promise.all([
      getBoxesByLocation('PACKING'),
      getBoxesByLocation('TRANSITO'),
    ]);

    // ── 2. Unimos los resultados sin mutar ninguno ───────────────────
    const eggs = [...packing, ...transito];

    return response(200, eggs);
  } catch (error) {
    console.error('Error en getPacking+Transito:', error);
    return response(
      500,
      'Error al obtener huevos en PACKING/TRANSITO',
      { error: error.message },
    );
  }
};
