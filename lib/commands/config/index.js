var util = require('util');
var format = require('chalk');

module.exports = function (cli) {
  var command = cli.command('config');
  
  command.description('edit keys and values from your app');
  command.action(function (done) {
    cli.log(format.blue('\n=== app config ==='));
    cli.log(JSON.stringify(cli.config, null, 2));
    done(null, cli.config);
  });
  
  var add = command.task('add');
  var remove = command.task('remove');
  
  add.description('add a value to the config file'); 
  remove.description('remove a value from the config file'); 
  
  add.action(function (key, value, done) {
    cli.cwd.setConfigValue(key, value);
    cli.log('\nConfig value added');    
    done(null, cli.config);
  });
  
  remove.action(function (key, done) {
    if (!key) return done(cli.errors.MISSING_CONFIG_KEY);
    cli.cwd.removeConfigValue(key);
    cli.log('\n' + format.bold(key) + ' removed');
    done(null, cli.config);
  });
};