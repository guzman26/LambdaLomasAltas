import { ApiResponse, Location } from '../types';
import createApiResponse from '../utils/response';

/**
 * Moves a box to a new location
 * @param codigo - The box code
 * @param ubicacion - The new location
 * @returns API response
 */
async function moveBox(codigo: string, ubicacion: Location): Promise<ApiResponse> {
  try {
    console.log(`Mock implementation: Moving box ${codigo} to ${ubicacion}`);
    return createApiResponse(200, `Box ${codigo} moved to ${ubicacion}`, { codigo, ubicacion });
  } catch (error) {
    console.error(`❌ Error moving box ${codigo}:`, error);
    return createApiResponse(500, (error as Error).message);
  }
}

export default moveBox; 