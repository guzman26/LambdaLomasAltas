import type { Box } from '../../types';
/**
 * Updates an existing box record in the database
 *
 * @param {string} codigo - The codigo of the box to update
 * @param {Partial<Box>} updateData - The box data to be updated
 * @returns {Promise<Box>} - The updated box data
 */
declare const updateBox: (codigo: string, updateData: Partial<Box>) => Promise<Box>;
export default updateBox;
