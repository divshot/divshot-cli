module.exports = function (app) {
  app.program
    .command('promote [from] [to]')
    .description('promote one environment to another')
    .example('promote [from] [to]')
    .action(function (from, to) {
      var config = app.cwd.getConfig();
      
      if (!config || !config.name) return app.logger.error('Current directory is not a ' + 'Divshot.io'.blue + ' app');
      if (!from || !to) return app.logger.error('You must provide the environment to promote and its destination environment');
      
      app.logger.writeln();
      app.logger.write('Promoting ' + from.bold + ' to ' + to.bold + ' ... ');
      
      app.api.apps.id(config.name).releases.env(to).promote(from, function (err, release) {
        if (err) {
          app.logger.writeln();
          app.logger.error('There was an error promoting your app. Please try again.');
          return;
        }
        
        app.logger.write('done'.blue);
        app.logger.writeln();
      });
    });
};