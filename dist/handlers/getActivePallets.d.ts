import { ApiResponse } from "../types";
/**
 * Fetches all open pallets from the "Pallets" table using a Scan operation.
 * Note: Scans can be inefficient and costly on large tables. Consider using a
 * Global Secondary Index (GSI) on the 'estado' field if performance becomes an issue.
 * @returns {Promise<ApiResponse>} An API-style response object.
 */
declare const getOpenPallets: () => Promise<ApiResponse>;
export default getOpenPallets;
