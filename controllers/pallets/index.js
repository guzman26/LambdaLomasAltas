const create = require('./create');
const read = require('./read');
const update = require('./update');
const deletePallet = require('./delete');

module.exports = {
  create,
  read,
  update,
  delete: deletePallet
}; 