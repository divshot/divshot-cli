var fs = require('fs');
var path = require('path');
var upload = require('divshot-upload');
var bundleFiles = require('../../helpers/bundle_files');
var format = require('chalk');

exports.require = ['authenticate', 'config'];

exports.register = function (environment) {
  environment = environment || 'development';
  
  var command = this;
  var appRootDir = path.resolve(process.cwd(), command.config.root);
  var uploadOptions = {
    type: 'tar',
    token: command.user.get('token'),
    environment: environment,
    config: command.config,
    host: command.api.options.host
  };
  
  bundleFiles(appRootDir, command.config.exclude)
    .pipe(upload(uploadOptions))
      .on('message', function (msg) {
        command.update(msg);
      })
      .on('released', function (msg) {
        command.update('Deployed ' + msg, {success: true});
      })
      .on('releasing', function () {
        command.update('Releasing build...');
      })
      .on('loading', function () {
        command.update('.'); // TODO: implement this
      })
      .on('pushed', function () {
        var appUrl = 'http://' + environment + '.' + command.config.name + '.divshot.io';
        
        command.update('Application deployed to ' + format.bold.white(environment), {success: true});
        command.update('You can view your app at: ' + format.bold(appUrl), {success: true});
        command.done(null, appUrl);
        
        process.exit(0);
      })
      .on('unreleased', function (unreleasedFiles) {
        command.update(format.red('Error: ') + command.errors.FILES_NOT_RELEASED);
        
        Object.keys(unreleasedFiles).forEach(function (filename) {
          command.update(filename + ' unreleased');
        });
        
        command.error();
      })
      .on('error', function (err) {
        command.error(err);
      });
};

