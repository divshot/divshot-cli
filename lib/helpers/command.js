var _ = require('lodash');

module.exports = function (app) {
  return function (name) {
    return _.find(app.program.commands, function (command) {
      return command._name === name;
    });
  };
};