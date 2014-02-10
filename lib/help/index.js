var fs = require('fs');
var format = require('chalk');
var logo = fs.readFileSync(__dirname + '/logo.txt', {encoding: 'utf8'});
var print = require('pretty-print');

module.exports = function (cli) {
  var command = cli.command('help');
  
  command.action(function () {
    var write = writeWithPadding(this);
    var commands = require('./commands')(cli, write);
    var flags = require('./flags')(cli, write);
    
    intro();
    usage();
    commands();
    flags();
    
    function intro () {
      cli.log();
      cli.log(format.yellow(logo));
      cli.log();
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
        cli.log('  ' + data);
      }
    }
  });
};

