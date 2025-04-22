/**
 * Modelo para la entidad Pallet
 */
declare class Pallet {
    static getTableName(): string;
    static getMaxBoxesPerPallet(): number;
    /**
     * Validates a pallet id
     * @param palletId - Pallet ID
     * @returns Is valid
     */
    static isValidPalletId(palletId: unknown): boolean;
}
export default Pallet;
