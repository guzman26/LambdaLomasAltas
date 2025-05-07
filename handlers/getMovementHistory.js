const { dynamoDB, Tables } = require('../models/index');
const { getMovementsByDateRange } = require('../models/movementHistory');

async function getAllHistory(startDate, endDate) {
  const result = await getMovementsByDateRange(startDate, endDate);
  return result;
}

module.exports = getAllHistory;

