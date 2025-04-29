/**
 * Parses a box code into its components
 * @param {string} code - 15-digit box code
 * @returns {object} Parsed code components
 * @throws {Error} If code format is invalid
 */
const parseBoxCode = (code) => {
    if (!code || typeof code !== 'string') {
        throw new Error(`Código inválido: formato incorrecto`);
    }
    
    if (code.length !== 15) {
        throw new Error(`Código inválido: ${code} (longitud incorrecta, debe tener 15 dígitos)`);
    }

    // Validar que el código contiene solo dígitos
    if (!/^\d+$/.test(code)) {
        throw new Error(`Código inválido: ${code} (debe contener solo dígitos)`);
    }

    return {
        dia_semana: code.slice(0, 1),
        semana: code.slice(1, 3),
        año: `20${code.slice(3, 5)}`,
        operario: code.slice(5, 7),
        empacadora: code.slice(7, 8),
        horario_proceso: code.slice(8, 9) === "1" ? "Mañana" : "Tarde",
        calibre: code.slice(9, 11),
        formato_caja: code.slice(11, 12),
        contador: code.slice(12, 15),
    };
};

module.exports = { parseBoxCode };