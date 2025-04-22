import type { Box } from '../../types';
/**
 * Creates a new box record in the database
 *
 * @param {Object} boxData - The box data to be created
 * @returns {Promise<Box>} - The created box data
 */
declare const createBox: (boxData: Partial<Box>) => Promise<Box>;
export default createBox;
