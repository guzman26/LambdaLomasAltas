interface DeleteResult {
    success: boolean;
    message: string;
}
/**
 * Deletes a pallet from the database
 * @param codigo - The pallet code to delete
 * @returns Result of the deletion operation
 */
declare function deletePallet(codigo: string): Promise<DeleteResult>;
export default deletePallet;
