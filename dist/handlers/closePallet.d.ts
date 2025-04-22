/**
 * Interface for the Pallet data structure in DynamoDB relevant to this function.
 */
interface Pallet {
    codigo: string;
    estado: 'open' | 'closed' | string;
    cajas?: string[];
}
/**
 * Toggles the status of a pallet between 'open' and 'closed'.
 * @param {string} codigo - The code of the pallet to update
 * @returns {Promise<Pallet>} - The updated pallet info
 * @throws {Error} - If the pallet doesn't exist or fails validation
 */
export declare function togglePalletStatus(codigo: string): Promise<Pallet>;
export default togglePalletStatus;
