var commands = require('../index.js');
var print = require('pretty-print');
var format = require('chalk');

module.exports = function (write) {
  return function () {
    var description ={};
    
    write('');
    write(format.yellow('Commands:') + ' (use divshot <command> help for details)');
    write('');
    
    Object.keys(commands).forEach(function (command) {
      if (commands[command].description) {
        description[command] = commands[command].description;
      } 
      
      // if (commands[command].tasks) {
      //   Object.keys(commands[command].tasks).forEach(function (task) {
      //     if (commands[command].tasks[task].description) {
      //       description[command + ':' + task] = commands[command].tasks[task].description
      //     }
      //   });
      // }
    });
    
    print(description, {
      leftPadding: 4,
      rightPadding: 4
    });
  };
};