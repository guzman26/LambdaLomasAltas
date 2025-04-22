import AWS from 'aws-sdk';
import type { Box } from '../../types';
import BoxModel from '../../models/Box';
import PalletModel from '../../models/Pallet';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

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
const deleteBox = async (codigo: string): Promise<DeleteResult> => {
  try {
    // 1. Get the box to check existence and associated pallet
    const getBoxParams = {
      TableName: BoxModel.getTableName(),
      Key: { codigo: codigo }
    };
    
    const boxResult = await dynamoDB.get(getBoxParams).promise();
    const box = boxResult.Item as Box | undefined;

    if (!box) {
      return {
        success: false,
        message: `La caja con código ${codigo} no existe`
      };
    }

    // 2. If the box is assigned to a pallet, update the pallet
    if (box.palletId) {
      const getPalletParams = {
        TableName: PalletModel.getTableName(),
        Key: { codigo: box.palletId }
      };
      
      const palletResult = await dynamoDB.get(getPalletParams).promise();
      const pallet = palletResult.Item;

      if (pallet) {
        // Remove the box from the pallet's box list
        const updatedBoxes = pallet.cajas.filter((item: string) => item !== codigo);

        // Update the pallet
        const updatePalletParams = {
          TableName: PalletModel.getTableName(),
          Key: { codigo: box.palletId },
          UpdateExpression: 'SET cajas = :boxes, cantidadCajas = :newCount',
          ExpressionAttributeValues: {
            ':boxes': updatedBoxes,
            ':newCount': Math.max(0, pallet.cantidadCajas - 1)
          }
        };
        
        await dynamoDB.update(updatePalletParams).promise();
      }
    }

    // 3. Delete the box from the database
    const deleteBoxParams = {
      TableName: BoxModel.getTableName(),
      Key: { codigo: codigo }
    };
    
    await dynamoDB.delete(deleteBoxParams).promise();

    return {
      success: true,
      message: `Caja ${codigo} eliminada con éxito`
    };
  } catch (error) {
    console.error(`Error deleting box ${codigo}:`, error);
    return {
      success: false,
      message: `Error al eliminar la caja: ${(error as Error).message}`
    };
  }
};

export default deleteBox;