/* handlers/moveBox.js */
const {
  getBoxByCode,
  moveBox,              // update ubicacion
} = require('../models/boxes');

const createApiResponse = require('../utils/response');

/* ───────────────── helpers ───────────────── */
const VALID_DESTS = ['PACKING', 'BODEGA', 'VENTA', 'TRANSITO'];

const isValidBoxCode = (code) => /^\d{15}$/.test(code);

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

    /* 3) Actualizar ubicación mediante el modelo */
    const updated = await moveBox(codigo, destino);

    return createApiResponse(
      200,
      `Caja ${codigo} movida a ${destino}`,
      updated
    );
  } catch (err) {
    console.error('❌ Error moviendo caja:', err);
    return createApiResponse(500, `Error al mover caja: ${err.message}`);
  }
};

module.exports = { moveEgg };
