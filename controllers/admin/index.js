const dashboard = require('./dashboard');
const issues = require('./issues');
const system = require('./system');

module.exports = {
  ...dashboard,
  ...issues,
  ...system
}; 