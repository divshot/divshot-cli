var promptly = require('promptly');

module.exports = function (app) {
  app.program
    .command('destroy [app_name]')
    .description('delete a divshot.io app')
    .example('destroy [app name]')
    .withAuth()
    .handler(function (appName) {
      promptly.confirm('Are you sure you want to permanantly delete this app? (y/n)', function(err, confirmed) {
        if (!confirmed) return;
        
        app.api.apps.list(function (err, apps) {
          if (err || apps.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');
          
          var appObj = app._.find(apps.self, function (ioApp) {
            return ioApp.name === appName;
          });
          
          if (!appObj) return app.logger.error(app.format.bold(appName) + ' app does not exist');
          
          app.api.apps.one(appObj.id).remove(function (err) {
            app.logger.writeln();
            app.logger.success(app.format.bold(appName) + ' has been permanantly deleted.');
          });
        });
      });
    });
};