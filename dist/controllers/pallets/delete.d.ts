import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
export interface DeleteResult {
    success: boolean;
    message: string;
}
/**
 * Deletes a pallet from the database and updates all associated boxes/eggs.
 * @param {string} palletCode - Code of the pallet to delete.
 * @returns {Promise<DeleteResult>} - Result of the operation.
 */
declare function deletePallet(palletCode: string): Promise<DeleteResult>;
export declare const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>;
declare const _default: {
    deletePallet: typeof deletePallet;
};
export default _default;
