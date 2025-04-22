import { Location, Pallet } from '../../types';
/**
 * Updates a pallet's location
 * @param codigo - The pallet code
 * @param location - The new location
 * @returns The updated pallet
 */
declare function updatePalletLocation(codigo: string, location: Location): Promise<Pallet>;
/**
 * Updates a pallet's status
 * @param codigo - The pallet code
 * @param status - The new status (ACTIVE or CLOSED)
 * @returns The updated pallet
 */
declare function updatePalletStatus(codigo: string, status: 'ACTIVE' | 'CLOSED'): Promise<Pallet>;
/**
 * Adds a box to a pallet
 * @param palletCodigo - The pallet code
 * @param boxCodigo - The box code to add
 * @returns The updated pallet
 */
declare function addBoxToPallet(palletCodigo: string, boxCodigo: string): Promise<Pallet>;
declare const _default: {
    updatePalletLocation: typeof updatePalletLocation;
    updatePalletStatus: typeof updatePalletStatus;
    addBoxToPallet: typeof addBoxToPallet;
};
export default _default;
