const parsePalletCode = (code) => {
    if (!code || typeof code !== 'string') {
        throw new Error(`Código de pallet inválido: formato incorrecto`);
    }
    
    if (code.length !== 12) {
        console.log(code.length)
        throw new Error(`Código de pallet inválido: ${code} (longitud incorrecta, debe tener 12 dígitos)`);
    }

    // Validar que el código contiene solo dígitos
    if (!/^\d+$/.test(code)) {
        throw new Error(`Código de pallet inválido: ${code} (debe contener solo dígitos)`);
    }

    return {
        dia_semana: code.slice(0, 1),
        semana: code.slice(1, 3),
        año: `20${code.slice(3, 5)}`,
        horario_proceso: code.slice(5, 6) === "1" ? "Mañana" : "Tarde",
        calibre: code.slice(6, 8),
        formato_caja: code.slice(8, 9),
        contador: code.slice(9, 12),
    };
};

module.exports = { parsePalletCode };