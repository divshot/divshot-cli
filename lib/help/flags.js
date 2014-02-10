// _flagsWithCombinedAliasvar commands = require('../index.js');

var print = require('pretty-print');
var format = require('chalk');

module.exports = function (cli, write) {
  return function () {
    var description ={};
    
    write('');
    write(format.yellow('Global Flags:'));
    write('');
    
    Object.keys(cli._flagsWithCombinedAlias).forEach(function (name) {
      var flag = cli._flagsWithCombinedAlias[name];
      description[name] = flag._description;
    });
    
    print(description, {
      leftPadding: 4,
      rightPadding: 4
    });
  };
};