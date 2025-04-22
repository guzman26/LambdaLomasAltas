export interface DeleteResult {
    success: boolean;
    message: string;
}
/**
 * Deletes a box record from the database and updates the associated pallet
 *
 * @param {string} codigo - The codigo of the box to delete
 * @returns {Promise<DeleteResult>} - The deletion result
 */
declare const deleteBox: (codigo: string) => Promise<DeleteResult>;
export default deleteBox;
