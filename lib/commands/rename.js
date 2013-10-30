var promptly = require('promptly');

module.exports = function (app) {
  app.program
    .command('rename [name]')
    .description('change the name of an app')
    .example('rename [name]')
    .withConfig()
    .withAuth()
    .handler(function (name) {
      var self = this;
      var config = this.config;
      var interval;
      
      if (!name) return app.logger.error('You must provide a new name for your app');
      
      promptly.confirm('Are you sure you want to rename this app? It will be permanant and change the app\'s url. (y/n)', function (err, rename) {
        if (!rename) return;
        
        app.logger.writeln();
        app.logger.write('Renaming app to ' + name.bold + ' ...');
        
        interval = setInterval(function () {
          app.logger.write('.');
        }, 800);
        
        app.api.apps.id(self.config.name).rename(name, function (err, response) {
          clearInterval(interval);
          
          if (response.error) return app.logger.error(response.error);
          if (response.statusCode && response.statusCode >= 400) return app.logger.error('Invalid request. Please try again.');
          
          app.cwd.setConfigValue('name', name);
          
          app.logger.write(' done'.blue);
          app.logger.writeln();
          app.logger.success(config.name.bold + ' has been renamed to ' + name.bold);
        });
      });
    });
};