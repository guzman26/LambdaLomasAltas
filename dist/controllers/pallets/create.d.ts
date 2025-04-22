import { ApiResponse } from "../../types";
/**
 * Handles the creation of a new pallet, appending a unique 3-digit number to the base code.
 * @param {string} baseCode - The 9-digit base code (DSSYYHF)
 * @returns {Promise<ApiResponse>} API response with the created pallet or an error.
 */
export declare function handleCreatePallet(baseCode: string): Promise<ApiResponse>;
export default handleCreatePallet;
