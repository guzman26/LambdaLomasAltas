/**
 * Utility functions for handling DynamoDB errors with better context
 */

/**
 * Handles DynamoDB errors with better context and standardized error messages
 * @param {Error} error - The original DynamoDB error
 * @param {string} operation - The operation being performed (e.g., 'get', 'query', 'update')
 * @param {string} entity - The entity being operated on (e.g., 'box', 'pallet')
 * @param {string} [id] - The ID of the entity (optional)
 * @returns {Error} - A new error with better context
 */
function handleDynamoDBError(error, operation, entity, id = '') {
  console.error(`DynamoDB Error: ${operation} ${entity} ${id}:`, error);

  // Common DynamoDB errors with more user-friendly messages
  if (error.code === 'ConditionalCheckFailedException') {
    return new Error(`La operación falló porque la condición no se cumplió (${operation} ${entity} ${id})`);
  }
  
  if (error.code === 'ResourceNotFoundException') {
    return new Error(`Recurso no encontrado: ${entity}${id ? ` con ID ${id}` : ''}`);
  }
  
  if (error.code === 'ProvisionedThroughputExceededException') {
    return new Error('Límite de capacidad excedido. Por favor, inténtelo de nuevo en unos momentos.');
  }
  
  if (error.code === 'ThrottlingException') {
    return new Error('Demasiadas solicitudes. Por favor, inténtelo de nuevo en unos momentos.');
  }
  
  if (error.code === 'ValidationException') {
    return new Error(`Error de validación: ${error.message}`);
  }
  
  if (error.code === 'TransactionCanceledException') {
    return new Error(`Transacción cancelada: ${error.message}`);
  }

  // Default error message with context
  return new Error(`Error al ${operation} ${entity}${id ? ` ${id}` : ''}: ${error.message}`);
}

/**
 * Validates required parameters
 * @param {Object} params - Parameters to validate
 * @param {Array<string>} required - List of required parameter names
 * @throws {Error} If any required parameter is missing
 */
function validateRequiredParams(params, required) {
  const missing = required.filter(param => {
    const value = params[param];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    throw new Error(`Parámetros requeridos faltantes: ${missing.join(', ')}`);
  }
}

/**
 * Data validation utility functions
 */
const validators = {
  /**
   * Validates a box code format (15 digits)
   * @param {string} code - The box code to validate
   * @returns {boolean} True if valid
   */
  isValidBoxCode: (code) => {
    return typeof code === 'string' && /^\d{15}$/.test(code);
  },

  /**
   * Validates a pallet code format (12 digits)
   * @param {string} code - The pallet code to validate
   * @returns {boolean} True if valid
   */
  isValidPalletCode: (code) => {
    return typeof code === 'string' && /^\d{12}$/.test(code);
  },

  /**
   * Validates a base code format (9 digits)
   * @param {string} code - The base code to validate
   * @returns {boolean} True if valid
   */
  isValidBaseCode: (code) => {
    return typeof code === 'string' && /^\d{9}$/.test(code);
  },

  /**
   * Validates a valid location
   * @param {string} location - The location to validate
   * @returns {boolean} True if valid
   */
  isValidLocation: (location) => {
    return ['PACKING', 'BODEGA', 'VENTA', 'TRANSITO'].includes(location);
  },

  /**
   * Validates an ISO date string
   * @param {string} dateStr - The date string to validate
   * @returns {boolean} True if valid
   */
  isValidISODate: (dateStr) => {
    if (typeof dateStr !== 'string') return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && dateStr.includes('T');
  },

  /**
   * Validates that a value is a non-empty string
   * @param {*} value - The value to validate
   * @returns {boolean} True if valid
   */
  isNonEmptyString: (value) => {
    return typeof value === 'string' && value.trim().length > 0;
  },

  /**
   * Validates that a value is a positive integer
   * @param {*} value - The value to validate
   * @returns {boolean} True if valid
   */
  isPositiveInteger: (value) => {
    return Number.isInteger(value) && value > 0;
  }
};

/**
 * Validates data based on expected type and format
 * @param {Object} data - Data to validate
 * @param {Object} validations - Validation rules mapping field names to validator functions
 * @throws {Error} If validation fails
 */
function validateData(data, validations) {
  const errors = [];
  
  Object.entries(validations).forEach(([field, validator]) => {
    if (data[field] !== undefined && !validator(data[field])) {
      errors.push(`Campo ${field} inválido`);
    }
  });
  
  if (errors.length > 0) {
    throw new Error(`Errores de validación: ${errors.join(', ')}`);
  }
}

module.exports = {
  handleDynamoDBError,
  validateRequiredParams,
  validators,
  validateData
}; 