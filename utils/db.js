const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const EGG_TABLE = 'Boxes';
const PALLETS_TABLE = 'Pallets';

/**
 * Parses a fecha-calibre-formato string into its components
 * @param {string} fcf - 9-digit string representing date, caliber and format info
 * @returns {object} Parsed components
 */
function parseFechaCalibreFormato(fcf) {
  if (typeof fcf !== 'string' || fcf.length !== 9) {
    throw new Error(`Invalid string: expected 9 digits but received "${fcf}"`);
  }

  const dayStr = fcf.slice(0, 1);
  const weekStr = fcf.slice(1, 3);
  const yearStr = fcf.slice(3, 5);
  const horario = fcf.slice(5, 6);
  const calibre = fcf.slice(6, 8);
  const formato = fcf.slice(8, 9);

  const day = Number(dayStr);
  const week = Number(weekStr);
  const year = 2000 + Number(yearStr);

  return {
    raw: fcf,
    day,
    week,
    year,
    horario,
    calibre,
    formato,
  };
}

/**
 * Database operations for eggs and pallets
 */
const databaseService = {
  /**
   * Retrieves all eggs from database
   * @returns {Promise<Array>} List of all eggs
   */
  async getAllEggs() {
    console.log('📥 Retrieving all eggs...');

    const params = {
      TableName: EGG_TABLE,
    };

    try {
      const result = await dynamoDB.scan(params).promise();
      console.log(`✅ Retrieved ${result.Items.length} eggs.`);
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error retrieving eggs:', error);
      throw new Error('Error retrieving eggs from database');
    }
  },

  /**
   * Retrieves eggs by location using GSI
   * @param {string} location - Location to filter by
   * @returns {Promise<Array>} List of eggs in the specified location
   */
  async getBoxesByLocation(location) {
    console.log(`📥 Querying boxes in location: ${location}`);

    const params = {
      TableName: EGG_TABLE,
      IndexName: 'ubicacion-index',
      KeyConditionExpression: '#ubicacion = :locationValue',
      ExpressionAttributeNames: {
        '#ubicacion': 'ubicacion',
      },
      ExpressionAttributeValues: {
        ':locationValue': location,
      },
    };

    try {
      const result = await dynamoDB.query(params).promise();
      console.log(`✅ Retrieved ${result.Items?.length || 0} eggs in ${location}`);
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error querying eggs by location:', error);
      throw new Error('Error querying eggs by location');
    }
  },

  /**
   * Finds an available pallet matching the criteria
   * @param {string} manufacturingDate - Manufacturing date
   * @param {string} caliber - Egg caliber
   * @param {string} format - Box format
   * @returns {Promise<Object|null>} Available pallet or null if none found
   */
  async findAvailablePallet(manufacturingDate, caliber, format) {
    console.log(
      `🔍 Finding available pallet for date: ${manufacturingDate}, caliber: ${caliber}, format: ${format}`
    );

    const params = {
      TableName: PALLETS_TABLE,
      FilterExpression:
        'fechaFabricacion = :fecha AND calibre = :calibre AND formato = :formato AND cantidadCajas < :maxCajas',
      ExpressionAttributeValues: {
        ':fecha': manufacturingDate,
        ':calibre': caliber,
        ':formato': format,
        ':maxCajas': 60,
      },
    };

    try {
      const result = await dynamoDB.scan(params).promise();
      return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
      console.error('❌ Error finding available pallet:', error);
      throw new Error('Error finding available pallet');
    }
  },

  /**
   * Creates a new pallet
   * @param {string} manufacturingDate - Manufacturing date
   * @param {string} shift - Work shift
   * @param {string} caliber - Egg caliber
   * @param {string} format - Box format
   * @returns {Promise<Object>} Newly created pallet
   */
  async createPallet(manufacturingDate, shift, caliber, format) {
    console.log(
      `➕ Creating new pallet for date: ${manufacturingDate}, shift: ${shift}, caliber: ${caliber}, format: ${format}`
    );

    const palletId = `P-${Date.now()}`;
    const newPallet = {
      id: palletId,
      fechaFabricacion: manufacturingDate,
      calibre: caliber,
      formato: format,
      cantidadCajas: 0,
      cajas: [],
      fechaCreacion: new Date().toISOString(),
    };

    const params = {
      TableName: PALLETS_TABLE,
      Item: newPallet,
    };

    try {
      await dynamoDB.put(params).promise();
      return newPallet;
    } catch (error) {
      console.error('❌ Error creating new pallet:', error);
      throw new Error('Error creating new pallet');
    }
  },

  /**
   * Adds a box to a pallet and updates its counter
   * @param {string} palletId - Pallet ID
   * @param {string} boxId - Box ID
   * @returns {Promise<Object>} Updated pallet
   */
  async addBoxToPallet(palletId, boxId) {
    console.log(`➕ Adding box ${boxId} to pallet ${palletId}`);

    const params = {
      TableName: PALLETS_TABLE,
      Key: { codigo: palletId },
      UpdateExpression: `
        SET cajas = list_append(if_not_exists(cajas, :empty_list), :newBox),
            cantidadCajas = cantidadCajas + :increment
      `,
      ExpressionAttributeValues: {
        ':newBox': [boxId],
        ':empty_list': [],
        ':increment': 1,
      },
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await dynamoDB.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('❌ Error adding box to pallet:', error);
      throw new Error('Error adding box to pallet');
    }
  },

  /**
   * Retrieves a pallet by its code
   * @param {string} palletCode - Pallet code
   * @returns {Promise<Object|null>} Pallet object or null if not found
   */
  async getPalletByCode(palletCode) {
    console.log(`🔎 Fetching pallet with ID: ${palletCode}`);

    const params = {
      TableName: PALLETS_TABLE,
      Key: { codigo: palletCode },
    };

    try {
      const result = await dynamoDB.get(params).promise();
      return result.Item || null;
    } catch (error) {
      console.error('❌ Error fetching pallet:', error);
      throw new Error('Error retrieving pallet from database');
    }
  },

  /**
   * Updates a box with its assigned pallet ID
   * @param {string} boxCode - Box code
   * @param {string} palletId - Pallet ID
   * @returns {Promise<void>}
   */
  async updateBoxPalletAssignment(boxCode, palletId) {
    console.log(`🔄 Updating pallet ID ${palletId} for box ${boxCode}`);

    const params = {
      TableName: EGG_TABLE,
      Key: { codigo: boxCode },
      UpdateExpression: 'SET palletId = :palletId',
      ExpressionAttributeValues: {
        ':palletId': palletId,
      },
    };

    try {
      await dynamoDB.update(params).promise();
    } catch (error) {
      console.error("❌ Error updating box's pallet ID:", error);
      throw new Error("Error updating box's pallet ID");
    }
  },

  /**
   * Assigns a box to an existing pallet
   * @param {Object} boxData - Box data
   * @param {string} activePalletCode - Active pallet code
   * @returns {Promise<Object>} Updated pallet
   */
  async assignBoxToPallet(boxData, activePalletCode) {
    const { codigo, horario_proceso, calibre, formato_caja, fecha_registro } = boxData;
    console.log(`🔍 Box found: ${JSON.stringify(boxData, null, 2)}`);

    // Convert "Mañana"/"Tarde" to "1"/"2"
    let shiftValue;
    if (horario_proceso === 'Mañana') {
      shiftValue = '1';
    } else if (horario_proceso === 'Tarde') {
      shiftValue = '2';
    } else {
      shiftValue = horario_proceso;
    }

    // Retrieve pallet by code
    const pallet = await this.getPalletByCode(activePalletCode);
    console.log(`🔍 Pallet found: ${JSON.stringify(pallet, null, 2)}`);

    if (!pallet) {
      throw new Error(`❌ Pallet not found with code: ${activePalletCode}`);
    }

    if (!pallet.fechaCalibreFormato) {
      throw new Error("❌ Pallet doesn't have 'fechaCalibreFormato' defined.");
    }

    const {
      horario: palletShift,
      calibre: palletCaliber,
      formato: palletFormat,
    } = parseFechaCalibreFormato(pallet.fechaCalibreFormato);
    const date = fecha_registro.split('T')[0];

    console.log(
      `📦 Attempting to assign box ${codigo} → pallet with shift: ${palletShift}, caliber: ${palletCaliber}, format: ${palletFormat}`
    );

    // Validation with clear messages
    if (pallet.cajas && pallet.cajas.includes(codigo)) {
      throw new Error(`⚠️ Box ${codigo} is already assigned to pallet ${activePalletCode}`);
    }

    if (shiftValue !== palletShift) {
      throw new Error(`⚠️ Inconsistent shift. Box: ${shiftValue}, Pallet: ${palletShift}`);
    }

    if (calibre !== palletCaliber) {
      throw new Error(`⚠️ Inconsistent caliber. Box: ${calibre}, Pallet: ${palletCaliber}`);
    }

    if (formato_caja !== palletFormat) {
      throw new Error(`⚠️ Inconsistent format. Box: ${formato_caja}, Pallet: ${palletFormat}`);
    }

    if (pallet.cantidadCajas >= 60) {
      throw new Error('⚠️ Pallet already has 60 boxes and is full.');
    }

    // Assign and update
    try {
      await this.addBoxToPallet(activePalletCode, codigo);
      await this.updateBoxPalletAssignment(codigo, activePalletCode);
      return pallet;
    } catch (error) {
      console.error('❌ Technical error assigning box:', error);
      throw new Error(`❌ Failed to write to database: ${error.message}`);
    }
  },

  /**
   * Retrieves eggs by their state
   * @param {string} code - Box code
   * @param {string} state - Current state
   * @returns {Promise<Array>} List of eggs in the specified state
   */
  async getEggsByState(code, state) {
    // Implementation based on your requirements
    // This is a placeholder based on context clues from moveEgg.js
    console.log(`📥 Retrieving eggs with code ${code} in state ${state}`);

    const params = {
      TableName: EGG_TABLE,
      FilterExpression: 'codigo = :code AND estado = :state',
      ExpressionAttributeValues: {
        ':code': code,
        ':state': state,
      },
    };

    try {
      const result = await dynamoDB.scan(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error retrieving eggs by state:', error);
      throw new Error('Error retrieving eggs by state');
    }
  },

  /**
   * Updates an egg's state and location
   * @param {string} code - Box code
   * @param {string} boxId - Box ID
   * @param {string} newState - New state
   * @param {string} location - New location
   * @returns {Promise<Object>} Updated egg
   */
  async updateEggState(code, boxId, newState, location) {
    // Implementation based on your requirements
    // This is a placeholder based on context clues from moveEgg.js
    console.log(`🔄 Updating state to ${newState} and location to ${location} for box ${boxId}`);

    const timestamp = new Date().toISOString();
    const movementRecord = {
      timestamp,
      from: newState === 'PACKING' ? 'BODEGA' : 'PACKING',
      to: newState,
      location,
    };

    const params = {
      TableName: EGG_TABLE,
      Key: { codigo: code },
      UpdateExpression:
        'SET estado = :state, ubicacion = :location, historialMovimientos = list_append(if_not_exists(historialMovimientos, :empty_list), :movement)',
      ExpressionAttributeValues: {
        ':state': newState,
        ':location': location,
        ':movement': [movementRecord],
        ':empty_list': [],
      },
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await dynamoDB.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('❌ Error updating egg state:', error);
      throw new Error('Error updating egg state');
    }
  },

  /**
   * Moves all boxes in a pallet to a new location
   * @param {string} palletCode - Pallet code
   * @param {string} newLocation - New location (BODEGA, VENTA)
   * @returns {Promise<Object>} Result with updated boxes count
   */
  async movePalletWithBoxes(palletCode, newLocation) {
    console.log(`🔄 Moving pallet ${palletCode} to ${newLocation} with all its boxes`);

    try {
      // Get the pallet
      const pallet = await this.getPalletByCode(palletCode);

      if (!pallet) {
        throw new Error(`Pallet with code ${palletCode} not found`);
      }

      if (!pallet.cajas || pallet.cajas.length === 0) {
        throw new Error(`Pallet ${palletCode} has no boxes to move`);
      }

      console.log(`📦 Moving ${pallet.cajas.length} boxes from pallet ${palletCode}`);

      // Step 1: Move all boxes to new location
      const updatePromises = pallet.cajas.map(boxCode =>
        this.updateEggState(boxCode, boxCode, newLocation, newLocation)
      );

      const results = await Promise.all(updatePromises);

      // Step 2: Update pallet's location
      const updatePalletParams = {
        TableName: 'Pallets',
        Key: { codigo: palletCode },
        UpdateExpression: 'SET ubicacion = :ubicacion',
        ExpressionAttributeValues: {
          ':ubicacion': newLocation,
        },
      };

      await this.dynamoDB.update(updatePalletParams).promise();
      console.log(`📦✅ Pallet ${palletCode} location updated to ${newLocation}`);

      // Final result
      return {
        palletCode,
        newLocation,
        boxesUpdated: results.length,
        boxes: results,
      };
    } catch (error) {
      console.error(`❌ Error moving pallet with boxes: ${error.message}`);
      throw new Error(`Failed to move pallet with boxes: ${error.message}`);
    }
  },
  async getPallets() {
    console.log('📦 Retrieving all pallets...');

    const params = {
      TableName: PALLETS_TABLE,
    };

    try {
      const result = await dynamoDB.scan(params).promise();
      console.log(`✅ Retrieved ${result.Items?.length || 0} pallets.`);
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error retrieving pallets:', error);
      throw new Error('Error retrieving pallets from database');
    }
  },
};

module.exports = databaseService;
