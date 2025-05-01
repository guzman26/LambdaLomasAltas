const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const EGGS_TABLE = 'Boxes';
const PALLETS_TABLE = 'Pallets';

/**
 * Deletes a pallet from the database and updates all associated boxes
 * @param {string} palletCode - Code of the pallet to delete
 * @returns {Promise<object>} - Result of the operation
 */
async function deletePallet(palletCode) {
  console.log(`🗑️ Attempting to delete pallet with code: ${palletCode}`);

  try {
    // 1. First, get the pallet to check if it exists
    const { Item: pallet } = await dynamoDB
      .get({
        TableName: PALLETS_TABLE,
        Key: { codigo: palletCode },
      })
      .promise();

    if (!pallet) {
      console.log(`⚠️ Pallet with code ${palletCode} does not exist`);
      return {
        success: false,
        message: `El pallet con código ${palletCode} no existe`,
      };
    }

    // 2. If the pallet has boxes, update each box to remove the pallet reference
    if (pallet.cajas && pallet.cajas.length > 0) {
      console.log(`📦 Pallet has ${pallet.cajas.length} boxes, updating boxes...`);

      // For each box in the pallet, update to remove palletId
      const updatePromises = pallet.cajas.map(boxCode => {
        return dynamoDB
          .update({
            TableName: EGGS_TABLE,
            Key: { codigo: boxCode },
            UpdateExpression: 'REMOVE palletId',
            ConditionExpression: 'attribute_exists(codigo)',
          })
          .promise()
          .catch(err => {
            // If the box doesn't exist, just log and continue
            if (err.code === 'ConditionalCheckFailedException') {
              console.log(`⚠️ Box ${boxCode} not found, skipping`);
              return;
            }
            throw err;
          });
      });

      // Wait for all box updates to complete
      await Promise.all(updatePromises);
      console.log(`✅ All boxes updated successfully`);
    }

    // 3. Delete the pallet from the database
    await dynamoDB
      .delete({
        TableName: PALLETS_TABLE,
        Key: { codigo: palletCode },
      })
      .promise();

    console.log(`✅ Pallet ${palletCode} deleted successfully`);

    return {
      success: true,
      message: `Pallet ${palletCode} eliminado con éxito`,
    };
  } catch (error) {
    console.error(`❌ Error deleting pallet: ${error.message}`);
    return {
      success: false,
      message: `Error al eliminar el pallet: ${error.message}`,
    };
  }
}

// Handler for AWS Lambda
exports.handler = async event => {
  try {
    // Parse the request body
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // Extract the pallet code
    const { codigo } = requestBody || {};

    if (!codigo) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Falta el código del pallet',
        }),
      };
    }

    // Delete the pallet
    const result = await deletePallet(codigo);

    return {
      statusCode: result.success ? 200 : 400,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(`❌ Error in Lambda handler: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: `Error interno del servidor: ${error.message}`,
      }),
    };
  }
};

// Export for testing
module.exports = deletePallet;
