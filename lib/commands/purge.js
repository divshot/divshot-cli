var format = require('chalk');

module.exports = function (cli) {
  
  cli.command('purge <environment>')
    .description('manually purge your app\'s cache')
    .before('authenticate', 'isApp')
    .handler(purgeHandler);
  
  function purgeHandler (environment, done) {
    
    // No environment
    if (arguments.length < 2) {
      done = environment;
      environment = undefined;
    }
    
    var appName = cli.cwd.getConfig().name;
    var app = cli.api.apps.id(appName);
    
    if (environment) {
      app = app.env(environment);
    }
    
    cli.log();
    cli.log('Purging cache ...');
    
    app.purgeCache(function (err, response) {
      
      if (err) {
        return done(err.message);
      }
      
      if (response.statusCode == 401) {
        return done(cli.errors.NOT_ADMIN);
      }
      
      if (response.statusCode >= 400) {
        return done(cli.errors.DEFAULT);
      }
      
      if (environment) {
        cli.log('You app\'s cache for ' + format.bold(environment) + ' has been purged.', {success: true});
      }
      else {
        cli.log('Your app\'s cache has been purged.', {success: true});
      }
    });
  }
};