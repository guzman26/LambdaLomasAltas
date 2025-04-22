/**
 * Modelo para la entidad Caja (Box)
 */
declare class Box {
    /**
     * Validates a box code
     * @param code - Box code
     * @returns Is valid
     */
    static isValidBoxCode(code: string): boolean;
    /**
     * Extracts the fecha-calibre-formato from a box code
     * @param boxCode - Complete box code
     * @returns 9-digit FCF code
     */
    static extractFCF(boxCode: string): string;
    /**
     * Returns the name of the DynamoDB table for boxes
     * @returns Table name
     */
    static getTableName(): string;
}
export default Box;
