var print = require('pretty-print');

module.exports = function (app) {
  app.program
    .command('apps')
    .description('list your apps')
    .example('apps')
    .withAuth()
    .handler(function () {
      app.api.apps.list(function (err, apps) {
        app.logger.writeln();
        
        if (apps && apps.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');
        if (apps && apps.error) return app.logger.error(apps.error);
        if (!apps) return app.logger.error('There was an unexpected error. Please try again.');

        app.logger.info(app.format.blue('=== your apps ==='));
        app.logger.writeln();
        print(apps.self, {key: 'name'});
        
        // TODO: refactor this
        var group;
        
        for (group in apps) {
          if (group === 'self' || apps[group].length === 0) { continue; }
          if (!apps[group]) { continue; }
          
          app.logger.writeln();
          app.logger.info(app.format.blue('=== ' + group.replace('org:', '') + ' apps ==='));
          app.logger.writeln();
          
          print(apps[group], {key: 'name'});
        }
      });
    });
};