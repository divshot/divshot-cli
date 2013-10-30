module.exports = function (app) {
  app.program
    .command('domains')
    .description('list your domains')
    .example('domains')
    .action(function () {
      var config = app.cwd.getConfig();
      
      if (!config || !config.name) return app.logger.error('Current directory is not a ' + 'Divshot.io'.blue + ' app');
      
      app.api.apps.id(config.name).get(function (err, dioApp) {
        app.logger.writeln();
        if (!dioApp.length) return app.logger.info('You don\'t have any custom domains. Use ' + 'divshot domains:add www.domain.com'. bold + ' to add a domain.');
        
        app.logger.info('custom domains for ' + config.name.bold);
        
        app._.each(dioApp.custom_domains, function (domain) {
          app.logger.info('  ' + domain.bold);
        });
      });
    });
};