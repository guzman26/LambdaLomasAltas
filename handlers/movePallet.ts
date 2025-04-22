import AWS from 'aws-sdk';
import { ApiResponse, Location } from '../types';
import PalletModel from '../models/Pallet';
import SystemConfig from '../models/SystemConfig';
import * as dbUtils from '../utils/db';
import createApiResponse from '../utils/response';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Moves a pallet to a new location
 * 
 * @param {string} codigo - The pallet code
 * @param {Location} ubicacion - The new location
 * @returns {Promise<ApiResponse>} API response
 */
async function movePallet(
  codigo: string, 
  ubicacion: Location
): Promise<ApiResponse> {
  try {
    // Validate that the pallet exists
    const pallet = await dbUtils.getItem(PalletModel.getTableName(), { codigo });
    
    if (!pallet) {
      return createApiResponse(404, `Pallet with code ${codigo} not found`);
    }
    
    // Check if requested location is valid
    const validLocations = Object.values(SystemConfig.getLocations());
    if (!validLocations.includes(ubicacion)) {
      return createApiResponse(400, `Invalid location: ${ubicacion}. Valid options: ${validLocations.join(', ')}`);
    }
    
    // Pallets cannot be moved to PACKING
    if (ubicacion === SystemConfig.getLocations().PACKING) {
      return createApiResponse(400, 'Pallets cannot be moved to PACKING directly');
    }
    
    // Update pallet location
    const updatedPallet = await dbUtils.updateItem(
      PalletModel.getTableName(),
      { codigo },
      'SET ubicacion = :ubicacion, ultimaActualizacion = :timestamp',
      {
        ':ubicacion': ubicacion,
        ':timestamp': new Date().toISOString()
      }
    );
    
    return createApiResponse(200, `Pallet ${codigo} moved to ${ubicacion} successfully`, updatedPallet);
  } catch (error) {
    console.error(`Error moving pallet ${codigo} to ${ubicacion}:`, error);
    return createApiResponse(500, `Error moving pallet: ${(error as Error).message}`);
  }
}

export default movePallet; 