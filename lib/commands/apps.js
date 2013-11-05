module.exports = function (app) {
  app.program
    .command('apps')
    .description('list your apps')
    .example('apps')
    .withAuth()
    .handler(function () {
      app.api.apps.list(function (err, apps) {
        app.logger.writeln();
        
        if (apps.error) return app.logger.error(apps.error)
        if (apps.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');

        function logApp(dioApp) {
          app.logger.info('  ' + dioApp.name.bold);
        }

        app.logger.info('Your ' + 'Divshot.io'.blue + ' apps');
        app._.each(apps.self, logApp);

        var group;
        for (group in apps) {
          if (group === "self") { continue; }
          app.logger.info('Organization ' + group.replace('org:', '').blue + ' apps');

          app._.each(apps[group], logApp);
        }
      });
    });
};