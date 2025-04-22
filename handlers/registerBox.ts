import { ApiResponse } from '../types';
import createApiResponse from '../utils/response';

/**
 * Registers a new box
 * @param codigo - The box code
 * @param palletId - Optional pallet ID to associate with the box
 * @param customInfo - Optional custom info for the box
 * @returns API response
 */
async function registerBox(
  codigo: string, 
  palletId?: string, 
  customInfo?: string,
  scannedCodes?: string[]
): Promise<ApiResponse> {
  try {
    console.log(`Mock implementation: Registering box ${codigo}`);
    
    // If palletId is provided, associate the box with the pallet
    if (palletId) {
      console.log(`Associating box ${codigo} with pallet ${palletId}`);
    }
    
    return createApiResponse(201, `Box ${codigo} registered successfully`, { 
      codigo, 
      palletId, 
      customInfo,
      scannedCodes 
    });
  } catch (error) {
    console.error(`❌ Error registering box ${codigo}:`, error);
    return createApiResponse(500, (error as Error).message);
  }
}

export default registerBox; 