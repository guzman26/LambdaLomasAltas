const create = require('./create');
const read = require('./read');
const update = require('./update');
const deleteBox = require('./delete');

module.exports = {
  create,
  read,
  update,
  delete: deleteBox
}; 