var commands = require('../index.js');
var print = require('pretty-print');
var format = require('chalk');

module.exports = function (cli, write) {
  return function () {
    var description ={};
    
    write('');
    write(format.yellow('Commands:') + ' (use "divshot <command> help" for details)');
    write('');
    
    Object.keys(cli._commandsWithCombinedAlias).forEach(function (name) {
      var command = cli._commandsWithCombinedAlias[name];
      description[name] = command._description;
    });
    
    print(description, {
      leftPadding: 4,
      rightPadding: 4
    });
  };
};