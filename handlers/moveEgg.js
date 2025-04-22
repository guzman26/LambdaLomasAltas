const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const createApiResponse = require("../utils/response");

/**
 * Move a box between locations
 * 
 * @param {string} code - Box code
 * @param {string} destination - Destination location
 * @returns {Promise<Object>} API response
 */
const moveBox = async (code, destination) => {
  try {
    // Check if the box exists
    const { Item } = await dynamoDB.get({
      TableName: "Boxes",
      Key: { codigo: code }
    }).promise();
    
    if (!Item) {
      console.error(`❌ Box not found: ${code}`);
      return createApiResponse(404, `❌ Caja no encontrada: ${code}`);
    }
    
    console.log(`📦 Moving box ${code} from ${Item.ubicacion} to ${destination}`);
    
    // If the box is already at the destination
    if (Item.ubicacion === destination) {
      console.log(`⚠️ Box ${code} is already at ${destination}`);
      return createApiResponse(200, `⚠️ La caja ya se encuentra en ${destination}`, Item);
    }
    
    // Update the box location
    const updatedParams = {
      TableName: "Boxes",
      Key: { codigo: code },
      UpdateExpression: 'SET ubicacion = :destination, updatedAt = :timestamp',
      ExpressionAttributeValues: {
        ':destination': destination,
        ':timestamp': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const { Attributes: updatedBox } = await dynamoDB.update(updatedParams).promise();
    console.log(`✅ Box ${code} moved to ${destination}`);
    
    return createApiResponse(200, `✅ Caja movida a ${destination}`, updatedBox);
    
  } catch (error) {
    console.error(`❌ Error moving box: ${error.message}`);
    return createApiResponse(500, `❌ Error al mover la caja: ${error.message}`);
  }
};

module.exports = moveBox;
