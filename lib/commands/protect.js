var regular = require('regular');

module.exports = function (app) {
  app.program
    .command('protect [environment] [username:password]')
    .description('add http basic auth to any environment')
    .example('protect [environment] [username:password]')
    .withAuth()
    .withConfig()
    .handler(function (env, credentials) {
      var appName = this.config.name;
      
      if (!env) return app.logger.error('Application environment is required.');
      if (!credentials) return app.logger.error('Credentials are required');
      
      var username = credentials.split(':')[0];
      var password = credentials.split(':')[1];
      
      if (!regular.basicAuth.test(credentials) || !username || !password) return app.logger.error('Invalid credentials');
      
      app.api.apps.list(function (err, apps) {
        var appObj = app._.find(apps.self, function (ioApp) {
          return ioApp.name === appName;
        });
        
        if (!appObj) return app.logger.error(app.format.bold(appName) + ' app does not exist');
        
        app.api.apps.id(appObj.id).env(env).config({
          auth: username + ':' + password
        }, function (err, response) {
          if (err || response.statusCode !== +200) return app.logger.error('There was an error protecting ' + env + '. Please try again.');
          app.logger.success(app.format.bold(env) + ' has been protected.');
        });
      });
    });
};