var promptly = require('promptly');

module.exports = function (app) {
  app.program
    .command('rename [name]')
    .description('change the name of an app')
    .example('rename [new app name]')
    .withConfig()
    .withAuth()
    .handler(function (name) {
      var self = this;
      var config = this.config;
      
      if (!name) return app.logger.error('You must provide a new name for your app');
      
      promptly.confirm('Are you sure you want to rename this app? It will be permanant and change the app\'s url. (y/n)', function (err, rename) {
        if (!rename) return;
        
        app.logger.writeln();
        app.logger.write('Renaming app to ' + app.format.bold(name) + ' ...');
        
        var stopLoading = app.loading();
        
        app.api.apps.id(self.config.name).rename(name, function (err, response) {
          stopLoading();
          
          if (response.error) return app.logger.error(response.error);
          if (response.statusCode && response.statusCode >= 400) return app.logger.error('Invalid request. Please try again.');
          
          app.cwd.setConfigValue('name', name);
          
          app.logger.write(app.format.blue(' done'));
          app.logger.writeln();
          app.logger.success(app.format.bold(config.name) + ' has been renamed to ' + app.format.bold(name));
        });
      });
    });
};