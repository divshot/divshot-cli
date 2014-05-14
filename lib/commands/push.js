var fs = require('fs');
var path = require('path');
var upload = require('divshot-upload');
var bundleFiles = require('../helpers/bundle_files');
var format = require('chalk');
var _ = require('lodash');

module.exports = function (cli) {
  var command = cli.command('push <environment>');
  
  command.before('authenticate', 'isApp');
  command.description('deploy your app to the specified environment');
  command.handler(function (environment, done) {
    if (!environment) environment = 'development';
    
    var config = cli.cwd.getConfig();
    var appConfigRootPath = (config.root === '/') ? './' : config.root;
    var appRootDir = path.resolve(process.cwd(), appConfigRootPath);
    var uploadOptions = {
      type: 'tar',
      token: cli.user.get('token'),
      environment: environment,
      config: config,
      host: cli.api.options.host
    };
    
    if (!fs.existsSync(appRootDir)) return done(cli.errors.DIRECTORY_DOES_NOT_EXIST);
    
    if (environment === 'production') cli.log('\n' + format.yellow('Note:') + ' Deploying to production purges your application\'s CDN cache, which may take up to one minute.\n');
    
    bundleFiles(appRootDir, config.exclude)
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
          var appUrl = (environment === 'production') 
            ? 'http://' + config.name + '.divshot.io'
            : 'http://' + environment + '.' + config.name + '.divshot.io';
          
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
          var errorMessage = err;
          if (_.isObject(err)) errorMessage = err.error;
          done(errorMessage);
        });
  });
};