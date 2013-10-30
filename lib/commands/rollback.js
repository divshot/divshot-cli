module.exports = function (app) {
  app.program
    .command('rollback [environment]')
    .description('rollback an environment to a previous release')
    .example('rollback [environment]')
    .action(function (environment) {
      var config = app.cwd.getConfig();
      
      if (!environment) return app.logger.error('no environment provided: ' + 'divshot rollback [environment]'.bold);
      if (!config.name) return app.logger.error('Current directory is not a ' + 'Divshot.io'.blue + ' app');
      
      app.logger.writeln();
      app.logger.write('Rolling back ' + environment.bold + ' to previous release ... ');
      
      app.api.apps.id(config.name).releases.env(environment).rollback(function (err, response) {
        app.logger.write('done'.blue);
        app.logger.writeln();
      });
    });
};