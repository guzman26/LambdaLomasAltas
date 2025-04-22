import { ApiResponse } from '../../types';
/**
 * Gets all pallets
 */
export declare const getAllPallets: () => Promise<ApiResponse>;
/**
 * Gets active pallets
 */
export declare const getActivePallets: () => Promise<ApiResponse>;
/**
 * Gets closed pallets
 */
export declare const getClosedPallets: (ubicacion?: string) => Promise<ApiResponse>;
