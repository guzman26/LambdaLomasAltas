import { ApiResponse, Location } from '../types';
/**
 * Moves a box to a new location
 * @param codigo - The box code
 * @param ubicacion - The new location
 * @returns API response
 */
declare function moveBox(codigo: string, ubicacion: Location): Promise<ApiResponse>;
export default moveBox;
