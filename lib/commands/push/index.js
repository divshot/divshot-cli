var fs = require('fs');
var path = require('path');
var Build = require('./build');
var drainer = require('drainer');

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
      
      var build;
      var buildSequence = [
        function checkFiles (next) {
          Build.checkFileSizes(appRootDir, function (err) {
            if (err) return next(err);
            
            app.logger.writeln('Creating build ... ');
            next();
          });
        },
        
        function createBuild (next) {
          currentApp.builds.create(payload, function (err, buildData) {
            if (err) return next('Failed to initiate deploy: ' + err);
            
            next(null, buildData);
          });
        },
        
        function packageAndUploadBuild (buildData, next) {
          build = Build.create({
            app: currentApp,
            appRootDir: appRootDir,
            appConfig: config,
            environment: environment,
            buildData: buildData
          });
          
          build.package(next);
        },
        
        function finalizeBuild (next) {
          build.finalize(next);
        },
        
        function releaseBuild (next) {
          var stopLoading = app.loading();
                        
          build.release(function (err) {
            stopLoading();
            next();
          });
        }
      ];
      
      // Execuate build
      drainer(buildSequence, function (err) {
        if (err) {
          app.logger.error(err);
          process.exit(1);
        }
        
        app.logger.info('You can view your app at: ' + app.format.bold('http://') + app.format.bold(environment) + app.format.bold('.') + app.format.bold(config.name) + app.format.bold('.divshot.io'));
        process.exit(0);
      });
    });
};