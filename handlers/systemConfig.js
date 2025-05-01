/**
 * System configuration storage and retrieval module
 */
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const CONFIG_TABLE = 'SystemConfig';

/**
 * Persists a configuration key/value pair
 * @param {string} configKey - Configuration key
 * @param {string|number|boolean|object} configValue - Configuration value
 * @returns {Promise<void>}
 */
async function setSystemConfig(configKey, configValue) {
  try {
    await dynamoDB
      .put({
        TableName: CONFIG_TABLE,
        Item: { configKey, configValue },
      })
      .promise();
    console.log(`✅ Configuration saved: ${configKey}`);
  } catch (error) {
    console.error(`❌ Error saving configuration ${configKey}:`, error);
    throw new Error(`Failed to save configuration: ${error.message}`);
  }
}

/**
 * Retrieves a configuration value by key
 * @param {string} configKey - Configuration key to retrieve
 * @returns {Promise<any|null>} Configuration value or null if not found
 */
async function getSystemConfig(configKey) {
  try {
    const result = await dynamoDB
      .get({
        TableName: CONFIG_TABLE,
        Key: { configKey },
      })
      .promise();

    return result.Item ? result.Item.configValue : null;
  } catch (error) {
    console.error(`❌ Error retrieving configuration ${configKey}:`, error);
    throw new Error(`Failed to retrieve configuration: ${error.message}`);
  }
}

module.exports = {
  setSystemConfig,
  getSystemConfig,
};
