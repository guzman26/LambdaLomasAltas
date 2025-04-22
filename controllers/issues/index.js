const create = require('./create.js');
const read = require('./read');
const update = require('./update');
const deleteIssue = require('./delete');

module.exports = {
  create,
  read,
  update,
  delete: deleteIssue
}; 