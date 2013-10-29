module.exports = function (app) {
  app.program
    .command('apps')
    .description('list your apps')
    .example('apps')
    .action(function () {
      
      app.api.apps.list(function (err, apps) {
        app.logger.writeln();
        
        if (apps.error) return app.logger.error(apps.error)
        if (apps.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');
        
        if (!apps.length) {
          app.logger.info('You haven\'t created any apps yet.');
        }
        else{
          app.logger.info('Your ' + 'Divshot.io'.blue + ' apps');
          app.logger.writeln();
          app._.each(apps, function (dioApp) {
            app.logger.info('  ' + dioApp.name.bold);
          });
        }
      });
    });
};