var assert = require('assert');

var _ = require('lodash');
var fs = require('fs-extra');

var auth = require('./auth');

module.exports = function (imports) {
  
  var commands =  _(fs.readdirSync(__dirname))
    .map(function (filename) {
      
      if (filename === 'index.js') {
        return;
      }
      
      var command = require(__dirname + '/' + filename);
      
      return [command.register.attributes.name, command.register(imports)];
    })
    .filter(_.identity)
    .zipObject()
    .value();
  
  return commands;
};