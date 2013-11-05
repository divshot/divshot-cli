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
        
        if (apps.error) return app.logger.error(apps.error)
        if (apps.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');

        app.logger.info("=== your apps ===".blue);
        app.logger.writeln();
        print(apps.self, {key: 'name'});
        
        var group;
        
        for (group in apps) {
          if (group === "self" || apps[group].length === 0) { continue; }
          if (!apps[group]) { continue; }
          
          app.logger.info(('=== ' + group.replace('org:', '') + ' apps ===').blue);
          print(apps[group], {key: 'name'});
        }
      });
    });
};