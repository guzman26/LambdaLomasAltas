import { ApiResponse } from '../../types';
/**
 * Get boxes by location
 * @param {string} location - Location to filter by
 * @returns {Promise<ApiResponse>} API response
 */
export declare function getBoxesByLocation(location: string): Promise<ApiResponse>;
/**
 * Get boxes by date
 * @param {string} date - The date to filter by (YYYYMMDD format)
 * @returns {Promise<ApiResponse>} API response
 */
export declare function getBoxesByDate(date: string): Promise<ApiResponse>;
/**
 * Get all boxes
 * @returns {Promise<ApiResponse>} API response
 */
export declare function getAllBoxes(): Promise<ApiResponse>;
/**
 * Get unassigned boxes in packing
 * @returns {Promise<ApiResponse>} API response
 */
export declare function getUnassignedBoxesInPacking(): Promise<ApiResponse>;
declare const _default: {
    getUnassignedBoxesInPacking: typeof getUnassignedBoxesInPacking;
    getBoxesByLocation: typeof getBoxesByLocation;
    getAllBoxes: typeof getAllBoxes;
    getBoxesByDate: typeof getBoxesByDate;
};
export default _default;
