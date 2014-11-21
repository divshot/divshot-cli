var promptly = require('promptly');
var format = require('chalk');

module.exports = function (cli) {
  var command = cli.command('rename <new name>');
  
  command.before('authenticate', 'isApp');
  command.description('change the name of the app');
  command.handler(function (name, done) {
    var config = cli.cwd.getConfig();
    var originalName = config.name;
    
    if (!name) return done(cli.errors.MISSING_APP_NAME);
    
    promptly.confirm('Are you sure you want to rename this app? It will be permanant and change the app\'s url. (y/n)', function (err, rename) {
      if (!rename) return done();
      
      cli.log('Renaming app to ' + format.bold(name) + ' ...');
      
      cli.api.apps.id(originalName).update({name: name}, function (err, response) {
        if (response.error) return done(response.error);
        if (response.statusCode && response.statusCode >= 400) return done(cli.errors.DEFAULT);
        
        cli.cwd.setConfigValue('name', name);
        cli.log(format.bold(originalName) + ' has been renamed to ' + format.bold(name), {success: true});
        done(null, config);
      });
    });
  });
};