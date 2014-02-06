var fs = require('fs');
var path = require('path');
var argv = require('optimist').argv;
var upload = require('divshot-upload');
var bundleFiles = require('../helpers/bundle_files');

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
      var appRootDir = path.resolve(process.cwd(), this.config.root);
      var config = this.config;
      var uploadOptions = {
        type: 'tar',
        token: app.user.get('token'),
        environment: environment,
        config: this.config,
        host: app.api.options.host
      };
      
      bundleFiles(appRootDir, this.config.exclude)
        .pipe(upload(uploadOptions))
          .on('message', app.logger.info.bind(app.logger))
          .on('released', function (msg) {
            app.logger.success('Deployed ' + msg);
          })
          .on('releasing', function () {
            app.logger.info('Releasing build...');
          })
          .on('loading', function () {
            app.logger.info('.'); // TODO: implement this
          })
          .on('pushed', function () {
            app.logger.success('Application deployed to ' + app.format.bold.white(environment));
            app.logger.info('You can view your app at: ' + app.format.bold('http://') + app.format.bold(environment) + app.format.bold('.') + app.format.bold(config.name) + app.format.bold('.divshot.io'));
            process.exit(0);
          })
          .on('unreleased', function (unreleasedFiles) {
            app.logger.error('Not all files released.');
            
            Object.keys(unreleasedFiles).forEach(function (filename) {
              app.logger.error(filename + ' unreleased');
            });
            
            process.exit(1);
          })
          .on('error', function (err) {
            app.logger.error(err);
            process.exit(1);
          });
    });
};
