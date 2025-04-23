const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const EGGS_TABLE = 'Boxes';
const PALLETS_TABLE = 'Pallets';

/**
 * Deletes a box from the database and updates the associated pallet
 * @param {string} boxCode - Code of the box to delete
 * @returns {Promise<object>} - Result of the operation
 */
async function deleteBox(boxCode) {
  console.log(`🗑️ Attempting to delete box with code: ${boxCode}`);
  
  try {
    // 1. First, get the box to check if it exists and if it has an associated pallet
    const { Item: box } = await dynamoDB
      .get({
        TableName: EGGS_TABLE,
        Key: { codigo: boxCode }
      })
      .promise();
    
    if (!box) {
      console.log(`⚠️ Box with code ${boxCode} does not exist`);
      return { 
        success: false, 
        message: `La caja con código ${boxCode} no existe` 
      };
    }
    
    // 2. If the box is assigned to a pallet, update the pallet
    if (box.palletId) {
      console.log(`📦 Box is assigned to pallet ${box.palletId}, updating pallet...`);
      
      // Get the pallet data
      const { Item: pallet } = await dynamoDB
        .get({
          TableName: PALLETS_TABLE,
          Key: { codigo: box.palletId }
        })
        .promise();
      
      if (pallet) {
        // Remove the box from the pallet's box list
        const updatedBoxes = pallet.cajas.filter(item => item !== boxCode);
        
        // Update the pallet with the new box list and decremented count
        await dynamoDB
          .update({
            TableName: PALLETS_TABLE,
            Key: { codigo: box.palletId },
            UpdateExpression: 'SET cajas = :boxes, cantidadCajas = cantidadCajas - :decrement',
            ExpressionAttributeValues: {
              ':boxes': updatedBoxes,
              ':decrement': 1
            }
          })
          .promise();
        
        console.log(`✅ Pallet ${box.palletId} updated successfully`);
      }
    }
    
    // 3. Delete the box from the database
    await dynamoDB
      .delete({
        TableName: EGGS_TABLE,
        Key: { codigo: boxCode }
      })
      .promise();
    
    console.log(`✅ Box ${boxCode} deleted successfully`);
    
    return { 
      success: true, 
      message: `Caja ${boxCode} eliminada con éxito` 
    };
    
  } catch (error) {
    console.error(`❌ Error deleting box: ${error.message}`);
    return { 
      success: false, 
      message: `Error al eliminar la caja: ${error.message}` 
    };
  }
}

// Handler for AWS Lambda
exports.handler = async (event) => {
  try {
    // Parse the request body
    const requestBody = typeof event.body === 'string' 
      ? JSON.parse(event.body) 
      : event.body;
    
    // Extract the box code
    const { codigo } = requestBody || {};
    
    if (!codigo) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Falta el código de la caja'
        })
      };
    }
    
    // Delete the box
    const result = await deleteBox(codigo);
    
    return {
      statusCode: result.success ? 200 : 400,
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error(`❌ Error in Lambda handler: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: `Error interno del servidor: ${error.message}`
      })
    };
  }
};

// Export for testing
module.exports = deleteBox; 