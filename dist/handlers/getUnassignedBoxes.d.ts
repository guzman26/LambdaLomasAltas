import { DynamoDbItem } from "../types";
/**
 * Returns all boxes that have not yet been assigned to a pallet.
 * Assumes each box has a `palletId` attribute set to "UNASSIGNED" when unassigned.
 */
declare function findBoxesWithoutPallet(): Promise<DynamoDbItem[]>;
export default findBoxesWithoutPallet;
