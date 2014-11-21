var format = require('chalk');
var promptly = require('promptly');
var _ = require('lodash');

module.exports = function (cli) {
  var command = cli.command('destroy <app name>', 'delete <app name>');
  
  command.before('authenticate');
  command.description('delete an app');
  
  command.handler(function (appName, done) {
    if (!appName) return done(cli.errors.MISSING_APP_NAME);
      
    promptly.confirm('Are you sure you want to permanantly delete this app? (y/n)', function (err, confirmed) {
      if (!confirmed) return done();
      
      cli.commands.apps(function (err, apps) {
        var appObj = _.find(apps.self, function (app) {
          return app.name === appName;
        });
        
        if (!appObj) return done(format.bold(appName) + ' app does not exist');
        
        cli.api.apps.one(appObj.name).remove(function (err, response) {
          if (err) return done(cli.errors.DEFAULT);
          if (response.status == 404) return done(response.error);
          
          cli.log(format.bold(appName) + ' has been permanantly deleted.', {success: true});
          done();
        });
      });
    });
  });
};