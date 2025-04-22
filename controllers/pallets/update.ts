import dynamoDb from '../../utils/dynamoDb';
import { Location, Pallet, DynamoDbItem } from '../../types';

/**
 * Updates a pallet's location
 * @param codigo - The pallet code
 * @param location - The new location
 * @returns The updated pallet
 */
async function updatePalletLocation(codigo: string, location: Location): Promise<Pallet> {
  const now = new Date().toISOString();
  
  const params = {
    TableName: process.env.PALLETS_TABLE || 'Pallets',
    Key: { codigo },
    UpdateExpression: 'set #location = :location, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#location': 'location'
    },
    ExpressionAttributeValues: {
      ':location': location,
      ':updatedAt': now
    },
    ReturnValues: 'ALL_NEW'
  };

  const { Attributes } = await dynamoDb.update(params);
  return Attributes as Pallet;
}

/**
 * Updates a pallet's status
 * @param codigo - The pallet code
 * @param status - The new status (ACTIVE or CLOSED)
 * @returns The updated pallet
 */
async function updatePalletStatus(codigo: string, status: 'ACTIVE' | 'CLOSED'): Promise<Pallet> {
  const now = new Date().toISOString();
  
  const params = {
    TableName: process.env.PALLETS_TABLE || 'Pallets',
    Key: { codigo },
    UpdateExpression: 'set #status = :status, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': now
    },
    ReturnValues: 'ALL_NEW'
  };

  const { Attributes } = await dynamoDb.update(params);
  return Attributes as Pallet;
}

/**
 * Adds a box to a pallet
 * @param palletCodigo - The pallet code
 * @param boxCodigo - The box code to add
 * @returns The updated pallet
 */
async function addBoxToPallet(palletCodigo: string, boxCodigo: string): Promise<Pallet> {
  const now = new Date().toISOString();
  
  const params = {
    TableName: process.env.PALLETS_TABLE || 'Pallets',
    Key: { codigo: palletCodigo },
    UpdateExpression: 'set boxes = list_append(if_not_exists(boxes, :empty_list), :box), boxCount = boxCount + :inc, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':box': [boxCodigo],
      ':empty_list': [],
      ':inc': 1,
      ':updatedAt': now
    },
    ReturnValues: 'ALL_NEW'
  };

  const { Attributes } = await dynamoDb.update(params);
  return Attributes as Pallet;
}

export default {
  updatePalletLocation,
  updatePalletStatus,
  addBoxToPallet
}; 