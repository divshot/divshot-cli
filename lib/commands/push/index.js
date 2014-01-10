var fs = require('fs');
var path = require('path');
var Build = require('./build');
var drainer = require('drainer');
var argv = require('optimist').argv;
var checkFileSizes = require('./check_files_sizes');

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
      var build = new Build({
        app: currentApp,
        appRootDir: appRootDir,
        appConfig: config,
        environment: environment,
        types: argv
      });
      
      build
        .on('released', app.logger.success, app.logger)
        .on('message', app.logger.info, app.logger)
        .on('error', app.logger.error, app.logger);
      
      var buildSequence = [
        function checkFiles (next) {
          checkFileSizes(appRootDir, function (err) {
            if (err) return next(err);
            
            app.logger.writeln('Creating build ... ');
            next();
          });
        },
        
        function createBuild (next) {
          build.create(payload, function (err, buildData) {
            if (err) return next('Failed to initiate deploy: ' + err);
            
            app.logger.info(app.format.blue('done'));
            next();
          });
        },
        
        function packageAndUploadBuild (next) {
          app.logger.info('Deploying build ... ');
          
          build.package(function (err, unreleased) {
            if (unreleased.length) {
              app.logger.info(unreleased);
              return next('ERROR: Not all files released!');
            }
            
            app.logger.info(app.format.blue('done'));
            next();
          });
        },
        
        function finalizeBuild (next) {
          app.logger.writeln('Finalizing build ... ');
          
          build.finalize(function (err) {
            if (err) return next(err);
            
            app.logger.write(app.format.blue('done'));
            next();
          });
        },
        
        function releaseBuild (next) {
          app.logger.writeln('Releasing build to ' + app.format.bold(environment) + ' ...');
          
          var stopLoading = app.loading();
                        
          build.release(function (err) {
            stopLoading();
            
            if (err) return next(err);
            
            app.logger.write(app.format.blue('done') + '\n');
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
        
        app.logger.success('Application deployed to ' + app.format.bold.white(environment));
        app.logger.info('You can view your app at: ' + app.format.bold('http://') + app.format.bold(environment) + app.format.bold('.') + app.format.bold(config.name) + app.format.bold('.divshot.io'));
        process.exit(0);
      });
    });
};