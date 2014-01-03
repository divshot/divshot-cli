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
      var config = this.config;
      var environment = (arguments.length > 1) ? arguments[0] : 'development';
      var payload = { // TODO: allow user to add a message to this deploy with flag -m
        config: config
      }; 
      var currentApp = app.api.apps.id(config.name);
      var appRootDir = path.resolve(process.cwd(), config.root);      
      
      Deploy.checkFileSizes(appRootDir, function (err) {
        if (err) {
          app.logger.error(err);
          process.exit(1);
        }
        
        app.logger.writeln('Creating build ... ');
        
        currentApp.builds.create(payload, function (err, buildData) {
          if (err) {
            app.logger.writeln();
            app.logger.error('Failed to initiate deploy: ' + err);
            process.exit(1);
            return;
          }
          
          var deploy = Deploy.create({
            app: currentApp,
            appRootDir: appRootDir,
            appConfig: config,
            environment: environment,
            buildData: buildData
          });
          
          deploy.initiate(function (err) {
            app.logger.writeln();
            
            if (err) {
              app.logger.error(err);
              return process.exit(1);
            }
            
            app.logger.info('You can view your app at: ' + app.format.bold('http://') + app.format.bold(environment) + app.format.bold('.') + app.format.bold(config.name) + app.format.bold('.divshot.io'));
            
            process.exit(0);
          });
        });
      });
    });
};