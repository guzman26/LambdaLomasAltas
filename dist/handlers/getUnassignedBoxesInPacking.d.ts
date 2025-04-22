import { DynamoDbItem } from "../types";
/**
 * Obtiene las cajas con ubicación "PACKING" y sin pallet asignado.
 * Usa un GSI en `ubicacion` para hacer un query eficiente.
 *
 * @returns {Promise<Array>} Lista de cajas sin pallet
 */
declare const getUnassignedBoxesInPacking: () => Promise<DynamoDbItem[]>;
export default getUnassignedBoxesInPacking;
