var format = require('chalk');
var _ = require('lodash');

module.exports = function (cli) {
  var command = cli.command('unprotect <environment>');
  
  command.before('authenticate', 'isApp');
  command.description('remove http basic auth to any environment');
  command.handler(function (env, done) {
      var appName = cli.cwd.getConfig().name;
      
      if (!env) return done(cli.errors.MISSING_ENVIRONMENT);
      
      cli.commands.apps(function (err, apps) {
        var appObj;
        
        _.each(apps, function (orgApps) {
          var app = _.find(orgApps, function (app) {
            return app.name === appName;
          });
          
          if (app) appObj = app;
        });
        
        if (!appObj) return done(format.bold(appName) + ' app does not exist');
        
        cli.api.apps.id(appObj.id).env(env).config({
          auth: ''
        }, function (err, response) {
          if (err || response.statusCode !== +200) return done(cli.errors.DEFAULT);
          
          cli.log(format.bold(env) + ' is now unprotected for ' + format.bold(appName) + '.', {success: true});
          done();
        });
      });
  });
};