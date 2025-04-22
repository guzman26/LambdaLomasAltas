/**
 * Fetch all pallets with estado = "closed" and a given ubicacion (attribute).
 * Example: If you pass "PACKING", only returns closed pallets in PACKING.
 *
 * @param {string} ubicacionValue - e.g. "PACKING"
 * @returns {Promise<object>} API-style response
 */
declare const getClosedPalletsByUbicacion: (ubicacionValue: string) => Promise<import("../types").ApiResponse>;
export default getClosedPalletsByUbicacion;
