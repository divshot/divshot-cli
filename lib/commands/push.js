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
    
    var count;
    var visitedCount = 0;
    var progressBar;
    
    var status = push({
      root: process.cwd(),
      environment: environment,
      config: cli.cwd.getConfig(),
      token: cli.api.options.token,
      timeout: cli.timeout,
      // hosting: {
      //   api: {
      //     host: process.env.DIVSHOT_API_URL || DIVSHOT_API_HOST,
      //     version: DIVSHOT_API_VERSION
      //   }
      // }
    });
    
    status.on('data', function (data) {
      
      cli.log(data);
    });
    
    status.on('done', function (appUrl) {
      
      done(null, appUrl);
    });
    
    status.on('error', function (err) {
      
      done(err);
    });
    
    status.on('file:count', function (fileCount) {
      
      count = fileCount;
      
      progressBar = new ProgressBar('Syncing '+ count +' inodes: [' + format.green(':bar') + '] ' + format.bold(':percent') + '', {
        complete: '=',
        incomplete: ' ',
        width: 50,
        total: count
      });
    });
    
    status.on('file:found', function (count) {
      
      visitedCount += count;
      progressBar.tick(count);
    });
    
    status.on('file:cachesuccess', function () {
      
      visitedCount += 1;
      progressBar.tick(1);
    });
    
    status.on('upload:success', function () {
      
      visitedCount += 1;
      progressBar.tick(1);
    });
    
    status.on('retry', function (err) {
      
      visitedCount = 0;
      console.log('\n' + format.red.underline(error.message));
      console.log(format.green.underline('Retrying...'));
    });
    
    status.on('synced', function (fileMap) {
      
      console.log('data', format.green('Synced!'));
    });
  });
};
