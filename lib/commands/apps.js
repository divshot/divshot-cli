module.exports = function (app) {
  app.program
    .command('apps')
    .description('list your divshot.io apps')
    .action(function () {
      
      app.api.apps.list(function (err, apps) {
        var msg = '\n';
        
        if (apps.error === 'invalid_token') {
          return app.logger.error('You need to log in before you can do this');
        }
        
        if (!apps.length) {
          msg += "You haven't created any apps yet.".blue;
        }
        else{
          msg += 'Your Divshot.io Apps\n'.blue;
          msg += '=====================\n';
          app._.each(apps, function (app) {
            msg += '- ' + app.name + '\n';
          });
        }
        
        app.logger.info(msg);
      });
    });
};