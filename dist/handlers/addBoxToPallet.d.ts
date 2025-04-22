/**
 * Interface for the Pallet data structure in DynamoDB.
 */
interface Pallet {
    codigo: string;
    estado: 'open' | 'closed' | string;
    cantidadCajas: number;
    cajas?: string[];
}
/**
 * Adds a box to a pallet, verifying compatibility
 * @param {string} palletId - The ID of the pallet
 * @param {string} boxCode - The code of the box to add
 * @returns {Promise<Pallet>} The updated pallet record
 * @throws {Error} If the operation fails or validation fails
 */
export declare function addBoxToPallet(palletId: string, boxCode: string): Promise<Pallet>;
export {};
