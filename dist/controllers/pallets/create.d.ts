import { Pallet } from '../../types';
/**
 * Creates a new pallet in the database
 * @param codigo - The pallet code
 * @returns The created pallet object
 */
declare function createPallet(codigo: string): Promise<Pallet>;
export { createPallet };
