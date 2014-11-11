var format = require('chalk');
var ProgressBar = require('progress');
var push = require('divshot-push');

var DIVSHOT_API_VERSION = '0.5.0';
var DIVSHOT_API_HOST = 'https://api.divshot.com';

module.exports = function (cli) {
  var command = cli.command('push <environment>', 'deploy <environment>');
  
  command.before('authenticate', 'isApp');
  command.description('deploy your app to the specified environment');
  command.handler(function (environment, done) {
    
    var progressBar;
    
    cli.log('');
    
    if (environment === 'production') {
      cli.log(format.yellow('Note:') + ' Deploying to production purges your application\'s CDN cache, which may take up to one minute.\n');
    }
    
    var pushStatus = push({
      root: process.cwd(),
      environment: environment,
      config: cli.cwd.getConfig(),
      token: cli.api.options.token,
      timeout: cli.timeout,
      hosting: {
        bucket: process.env.DIVSHOT_HASHED_BUCKET,
        api: {
          host: process.env.API_HOST || DIVSHOT_API_HOST,
          version: process.env.API_VERSION || DIVSHOT_API_VERSION
        }
      }
    });
    
    pushStatus.onEnd(function (data) {
      
      process.stdout.write('\n');
      process.stdout.write('Application deployed to ' + format.bold.white(data.environment) + '\n');
      process.stdout.write('You can view your app at: ' + format.bold(data.url) + '\n');
      
      done(null, data.url);
    });
    
    pushStatus.onError(function (err) {
      
      done(err);
    });
    
    // Build status
    pushStatus
      .onBuild('start', function () {
        
        process.stdout.write('Creating build ... ');
      })
      .onBuild('end', function (build) {
        
        process.stdout.write(format.green('✔') + '\n');
      });
    
    // Hashing status
    pushStatus
      .onHashing('start', function () {
        
        process.stdout.write('Hashing Directory Contents ...');
      })
      .onHashing('end', function () {
        
        process.stdout.write(format.green(' ✔') + '\n');
      });
    
    // Finalizing status
    pushStatus
      .onFinalize('start', function () {
        
        process.stdout.write('\nFinalizing build ... ');
      })
      .onFinalize('end', function () {
        
        process.stdout.write(format.green('✔') + '\n');
      })
    
    // Release status
    pushStatus
      .onRelease('start', function (environment) {
        
        process.stdout.write('Releasing build to ' + format.bold(environment) + ' ... ');
      })
      .onRelease('end', function () {
        
        process.stdout.write(format.green('✔') + '\n');
      });
    
    // App creation status (if needed)
    pushStatus
      .onApp('create', function (appName) {
        
        process.stdout.write(' App does not yet exist. Creating app ' + format.bold(appName) + ' ... ');
      })
    
    // Upload status
    pushStatus
      .onUpload('start', function (fileCount) {
        
        cli.log();
        
        progressBar = new ProgressBar('Syncing '+ fileCount +' files: [' + format.green(':bar') + '] ' + format.bold(':percent') + '', {
          complete: '=',
          incomplete: ' ',
          width: 50,
          total: fileCount
        });
      })
      .onUpload('progress', function (count) {
        
        progressBar.tick(count);
      })
      .onUpload('retry', function (err) {
        
        console.log('\n' + format.red.underline(err.message));
        console.log(format.green.underline('Retrying...'));
      });
  });
};
