var fs = require('fs');
var path = require('path');
var Deploy = require(__dirname + '/deploy');

module.exports = function (app) {
  app.program
    .command('push')
    .description('deploy your app to the specified environment')
    .example('push [environment]')
    .option('-z, --zip <zipfile>', 'upload a zip file instead of a tar (for testing/diagnostics)', fs.createReadStream)
    .option('-f, --file <file>', 'PUT a single file (for testing/diagnostics)', fs.createReadStream)
    .withAuth()
    .withConfig()
    .handler(function () {
      var environment = (arguments.length > 1) ? arguments[0] : 'development';
      var config = this.config;
      var payload = {}; // TODO: allow user to add a message to this deploy with flag -m
      var ioApp = app.api.apps.id(config.name);
      var appRootDir = path.resolve(process.cwd(), config.root);      
      
      Deploy.checkFileSizes(appRootDir, function (err) {
        if (err) process.exit(1);
        
        payload.config = config;

        app.logger.writeln('Creating build ... ');
        
        ioApp.builds.create(payload, function (err, build) {
          if (err) {
            app.logger.error('Failed to initiate deploy: ' + err);
            process.exit(1);
            return;
          }
          
          var deploy = Deploy.create({
            ioApp: ioApp,
            environment: environment,
            cwd: process.cwd(),
            appRootDir: appRootDir,
            build: build,
            config: app.cwd.getConfig()
          });
          
          deploy.initiate(function (err) {
            if (err) {
              app.logger.error('Failed while creating build: ' + err);
              process.exit(1);
            }
            app.logger.writeln();
            app.logger.info('You can view your app at: ' + app.format.bold('http://') + app.format.bold(environment) + app.format.bold('.') + app.format.bold(config.name) + app.format.bold('.divshot.io'));
          });
        });
      });
    });
};