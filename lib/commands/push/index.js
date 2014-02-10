var fs = require('fs');
var path = require('path');
var upload = require('divshot-upload');
var bundleFiles = require('../../helpers/bundle_files');
var format = require('chalk');

module.exports = function (cli) {
  var command = cli.command('push');
  
  command.before('authenticate');
  command.description('deploy your app to the specified environment');
  command.action(function (environment, done) {
    if (!environment) environment = 'development';
    
    var appRootDir = path.resolve(process.cwd(), cli.config.root);
    var uploadOptions = {
      type: 'tar',
      token: cli.user.get('token'),
      environment: environment,
      config: cli.config,
      host: cli.api.options.host
    };
    
    bundleFiles(appRootDir, cli.config.exclude)
      .pipe(upload(uploadOptions))
        .on('message', function (msg) {
          cli.log(msg);
        })
        .on('released', function (msg) {
          cli.log('Deployed ' + msg, {success: true});
        })
        .on('releasing', function () {
          cli.log('Releasing build...');
        })
        .on('loading', function () {
          cli.log('.'); // TODO: implement this
        })
        .on('pushed', function () {
          var appUrl = 'http://' + environment + '.' + cli.config.name + '.divshot.io';
          
          cli.log('Application deployed to ' + format.bold.white(environment), {success: true});
          cli.log('You can view your app at: ' + format.bold(appUrl), {success: true});
          done(null, appUrl);
          
          process.exit(0);
        })
        .on('unreleased', function (unreleasedFiles) {
          cli.log(format.red('Error: ') + cli.errors.FILES_NOT_RELEASED);
          
          Object.keys(unreleasedFiles).forEach(function (filename) {
            cli.log(filename + ' unreleased');
          });
          
          done(cli.errors.FILES_NOT_RELEASED);
        })
        .on('error', function (err) {
          done(err);
        });
  });
};


// exports.require = ['authenticate', 'config'];

// exports.description = 'deploy your app to the specified environment';

// exports.register = function (environment) {
//   environment = environment || 'development';
  
//   var command = this;
//   var appRootDir = path.resolve(process.cwd(), command.config.root);
//   var uploadOptions = {
//     type: 'tar',
//     token: command.user.get('token'),
//     environment: environment,
//     config: command.config,
//     host: command.api.options.host
//   };
  
//   bundleFiles(appRootDir, command.config.exclude)
//     .pipe(upload(uploadOptions))
//       .on('message', function (msg) {
//         cli.log(msg);
//       })
//       .on('released', function (msg) {
//         cli.log('Deployed ' + msg, {success: true});
//       })
//       .on('releasing', function () {
//         cli.log('Releasing build...');
//       })
//       .on('loading', function () {
//         cli.log('.'); // TODO: implement this
//       })
//       .on('pushed', function () {
//         var appUrl = 'http://' + environment + '.' + command.config.name + '.divshot.io';
        
//         cli.log('Application deployed to ' + format.bold.white(environment), {success: true});
//         cli.log('You can view your app at: ' + format.bold(appUrl), {success: true});
//         command.done(null, appUrl);
        
//         process.exit(0);
//       })
//       .on('unreleased', function (unreleasedFiles) {
//         cli.log(format.red('Error: ') + command.errors.FILES_NOT_RELEASED);
        
//         Object.keys(unreleasedFiles).forEach(function (filename) {
//           cli.log(filename + ' unreleased');
//         });
        
//         command.error();
//       })
//       .on('error', function (err) {
//         command.error(err);
//       });
// };

