module.exports = function (app) {
  app.program
    .command('promote [from] [to]')
    .description('promote one environment to another')
    .example('promote [from] [to]')
    .withAuth()
    .withConfig()
    .handler(function (from, to) {
      var config = this.config;
      
      if (!from || !to) return app.logger.error('You must provide the environment to promote and its destination environment');
      
      app.logger.writeln();
      app.logger.write('Promoting ' + from.bold + ' to ' + to.bold + ' ...');
      
      var stopLoading = app.loading();
      
      app.api.apps.id(config.name).releases.env(to).promote(from, function (err, release) {
        stopLoading();
        
        if (err) {
          app.logger.writeln();
          app.logger.error('There was an error promoting your app. Please try again.');
          return;
        }
        
        app.logger.write(' done'.blue);
        app.logger.writeln();
      });
    });
};