import { ApiResponse, Location } from '../types';
/**
 * Moves a pallet to a new location
 * @param codigo - The pallet code
 * @param ubicacion - The new location
 * @returns API response
 */
declare function movePallet(codigo: string, ubicacion: Location): Promise<ApiResponse>;
export default movePallet;
