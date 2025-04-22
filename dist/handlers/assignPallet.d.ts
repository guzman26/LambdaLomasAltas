/**
 * Interface for the Pallet data structure in DynamoDB.
 */
interface Pallet {
    codigo: string;
    ubicacion: string;
    estado: 'open' | 'closed' | string;
    cantidadCajas: number;
    cajas?: string[];
    createdAt: string;
    updatedAt?: string;
}
/**
 * Retrieves or creates a pallet in the database
 * @param {string} palletCode - Code identifying the pallet
 * @param {string} [ubicacion="PACKING"] - The initial location if creating a new pallet
 * @returns {Promise<Pallet>} The pallet object (existing or newly created)
 * @throws {Error} If pallet retrieval or creation fails
 */
export declare function assignPallet(palletCode: string, ubicacion?: string): Promise<Pallet>;
export default assignPallet;
