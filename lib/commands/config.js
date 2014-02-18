var util = require('util');
var format = require('chalk');

module.exports = function (cli) {
  var command = cli.command('config');
  var config = cli.cwd.getConfig();
  
  command.description('edit keys and values from your app');
  command.handler(function (done) {
    cli.log(format.blue('\n=== app config ==='));
    cli.log(JSON.stringify(config, null, 2));
    done(null, config);
  });
  
  var add = command.task('add <key> <value>');
  var remove = command.task('remove <key>');
  
  add.description('add a value to the config file'); 
  remove.description('remove a value from the config file'); 
  
  add.handler(function (key, value, done) {
    cli.cwd.setConfigValue(key, value);
    cli.log('\nConfig value added');    
    done(null, cli.cwd.getConfig());
  });
  
  remove.handler(function (key, done) {
    if (!key) return done(cli.errors.MISSING_CONFIG_KEY);
    cli.cwd.removeConfigValue(key);
    cli.log('\n' + format.bold(key) + ' removed');
    done(null, cli.cwd.getConfig());
  });
};