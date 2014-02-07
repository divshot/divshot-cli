var fs = require('fs');
var format = require('chalk');
var logo = fs.readFileSync(__dirname + '/logo.txt', {encoding: 'utf8'});
var print = require('pretty-print');

exports.register = function () {
  var command = this;
  var write = writeWithPadding(command);
  var commands = require('./commands')(write);
  var globalOptions = require('./global_options')(write);
  
  intro();
  usage();
  commands();
  globalOptions();
  
  function intro () {
    command.update();
    command.update(format.yellow(logo));
    command.update();
    write(format.yellow('Application-Grade Static Web Hosting.\n'))
    write(format.yellow('Host single-page apps and static sites with\n  all the power of a modern application platform.'))
  }
  
  function usage () {
    write('');
    write(format.yellow('Usage:'));
    write('');
    write('  divshot <command> <parameters> <options>');
  }

  function writeWithPadding(command) {
    return function (data) {
      command.update('  ' + data);
    }
  }
};

