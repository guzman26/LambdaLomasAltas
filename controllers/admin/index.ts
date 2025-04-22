import { ApiResponse } from '../../types';
import createApiResponse from '../../utils/response';

/**
 * Gets the system dashboard data
 */
const getSystemDashboard = async (): Promise<ApiResponse> => {
  console.log('Mock: Getting system dashboard');
  return createApiResponse(200, 'System dashboard', {
    totalBoxes: 0,
    totalPallets: 0,
    activePallets: 0,
    boxesByLocation: {
      PACKING: 0,
      BODEGA: 0,
      VENTA: 0,
      TRANSITO: 0
    }
  });
};

export default {
  getSystemDashboard
}; 