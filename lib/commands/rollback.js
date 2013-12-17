module.exports = function (app) {
  app.program
    .command('rollback [environment]')
    .description('rollback an environment to a previous release')
    .example('rollback [environment]')
    .withAuth()
    .withConfig()
    .handler(function (environment) {
      var config = this.config;
      
      if (!environment) return app.logger.error('no environment provided: ' + app.format.bold('divshot rollback [environment]'));
      
      app.logger.writeln();
      app.logger.write('Rolling back ' + app.format.bold(environment) + ' to previous release ...');
      
      var stopLoading = app.loading();
      
      app.api.apps.id(config.name).releases.env(environment).rollback(function (err, response) {
        stopLoading();
        
        app.logger.write(app.format.blue(' done'));
        app.logger.writeln();
      });
    });
};