import { ApiResponse, Location } from '../types';
/**
 * Moves a pallet to a new location
 *
 * @param {string} codigo - The pallet code
 * @param {Location} ubicacion - The new location
 * @returns {Promise<ApiResponse>} API response
 */
declare function movePallet(codigo: string, ubicacion: Location): Promise<ApiResponse>;
export default movePallet;
