import { ApiResponse } from '../types';
/**
 * Registers a new box
 * @param codigo - The box code
 * @param palletId - Optional pallet ID to associate with the box
 * @param customInfo - Optional custom info for the box
 * @returns API response
 */
declare function registerBox(codigo: string, palletId?: string, customInfo?: string, scannedCodes?: string[]): Promise<ApiResponse>;
export default registerBox;
