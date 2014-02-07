var format = require('chalk');
var promptly = require('promptly');
var _ = require('lodash');

module.exports = function (cli) {
  var command = cli.command('destroy', 'delete');
  
  command.before('authenticate');
  command.description('delete an app');
  
  command.action(function (appName, done) {
    promptly.confirm('Are you sure you want to permanantly delete this app? (y/n)', function (err, confirmed) {
      if (!confirmed) return done();
      
      cli.commands.apps(function (err, apps) {
        var appObj = _.find(apps.self, function (app) {
          return app.name === appName;
        });
        if (!appObj) return done(format.bold(appName) + ' app does not exist');
        
        cli.api.apps.one(appObj.id).remove(function (err) {
          if (err) return done(cli.errors.DEFAULT);
          
          cli.log(format.bold(appName) + ' has been permanantly deleted.', {success: true});
          done();
        });
      });
    });
  });
};