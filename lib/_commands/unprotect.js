module.exports = function (app) {
  app.program
    .command('unprotect [environment]')
    .description('remove http basic auth to any environment')
    .example('unprotect [environment]')
    .withAuth()
    .withConfig()
    .handler(function (env) {
      var appName = this.config.name;
      
      if (!env) return app.logger.error('Application environment is required.');
      
      app.api.apps.list(function (err, apps) {
        var appObj = app._.find(apps.self, function (ioApp) {
          return ioApp.name === appName;
        });
        
        if (!appObj) return app.logger.error(app.format.bold(appName) + ' app does not exist');
        
        app.api.apps.id(appObj.id).env(env).config({
          auth: ''
        }, function (err, response) {
          if (err || response.statusCode !== +200) return app.logger.error('There was an error removing protection from ' + env + '. Please try again.');
          app.logger.success(app.format.bold(env) + ' is now unprotected.');
        });
      });
    });
    
};