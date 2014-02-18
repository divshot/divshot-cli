var format = require('chalk');
var _ = require('lodash');

module.exports = function (cli) {
  var command = cli.command('unprotect');
  
  command.before('authenticate');
  command.description('remove http basic auth to any environment');
  command.handler(function (env, done) {
      var appName = cli.config.name;
      
      if (!env) return done(cli.errors.MISSING_ENVIRONMENT);
      
      cli.commands.apps(function (err, apps) {
        var appObj = _.find(apps.self, function (app) {
          return app.name === cli.config.name;
        });
        
        if (!appObj) return done(format.bold(cli.config.name) + ' app does not exist');
        
        cli.api.apps.id(appObj.id).env(env).config({
          auth: ''
        }, function (err, response) {
          if (err || response.statusCode !== +200) return done(cli.errors.DEFAULT);
          
          cli.log(format.bold(env) + ' is now unprotected.', {success: true});
          done();
        });
      });
  });
};