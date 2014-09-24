var fs = require('fs-extra');
var path = require('path');
var format = require('chalk');
var _ = require('lodash');
var glob = require('glob');
var async = require('async');
var tmp = require('tmp');
var ProgressBar = require('progress');
var globby = require('globby');

module.exports = function (cli) {
  var command = cli.command('push <environment>', 'deploy <environment>');
  
  command.before('authenticate', 'isApp');
  command.description('deploy your app to the specified environment');
  command.handler(function (environment, done) {
    if (!environment) environment = 'development';
    
    var config = cli.cwd.getConfig();
    var appConfigRootPath = (config.root && config.root === '/') ? './' : config.root;
    var appRootDir = path.resolve(process.cwd(), appConfigRootPath);
    
    if (!fs.existsSync(appRootDir)) return done(cli.errors.DIRECTORY_DOES_NOT_EXIST);
    
    if (environment === 'production') cli.log('\n' + format.yellow('Note:') + ' Deploying to production purges your application\'s CDN cache, which may take up to one minute.\n');
    
    // 1. glob directory appRootDir
    // 2. array subtract globs of config.excludes
    
    var globs = [appRootDir + "/**"];
    if (config.exclude) {
      config.exclude.forEach(function(exclusion) {
        globs.push("!" + appRootDir + "/" + exclusion + '/**');                        
      });
    }
    var filesToUpload = globby.sync(globs);
    
    process.stdout.write('Creating build ... ');
    deploy(config);
    
    function createAppBeforeBuild (config) {
      
      cli.log();
      process.stdout.write('App does not yet exist. Creating app ' + format.bold(config.name) + ' ... ');
      
      cli.api.apps.create(config.name.toLowerCase(), function (err, response, body) {
        if (err) return onError(err);
        if (response.error === 'invalid_token') return done(cli.errors.NOT_AUTHENTICATED);
        if (body.error) return onError(body);
        if (response.statusCode >= 400) return onError(body);

        deploy(config);
      });
    }
    
    function deploy (config) {
      
      // 4. Copy files (minus exclusions) to a tmp dir
      
      cli.api.apps.id(config.name).builds.create({config: config}, function(err, build){
        if (err) return onError(err);
        
        // App doesn't exist, create it
        if (build && build.status == 404) return createAppBeforeBuild(config);
        
        // Not allowed
        if (build && build.status == 401) return onError(build);
        
        // Any other error
        if (build && build.status) return onError(err);
        
        if (!build.loadpoint) {
          cli.log('Unexpected build data.');
          cli.log(format.red.underline('---Build Data Start---'));
          cli.log(JSON.stringify(build, null, 4));
          cli.log(format.red.underline('---Build Data End---'));
          return done('Contact support@divshot.com with this data for diagnostic purposes.')
        }
  
        cli.log(format.green('✔'));
        cli.log('');
       
        tmp.dir({unsafeCleanup: true}, function(err, tmpDir) {
          async.map(filesToUpload, function(src, callback){
  	        // This seems to be the main place path seperators are getting us into trouble.
  	        var _appRootDir = appRootDir.replace(/\\/g, '/');
  	        src = src.replace(/\\/g, '/');
  
            if (fs.statSync(src).isDirectory()) { callback(); return; };
            var dest = src.replace(_appRootDir, tmpDir + "/" + build.id).replace(/\\/g, '/');
            fs.ensureFileSync(dest);
            fs.copySync(src, dest);
  	        callback()  
  	      }, function() {
  
            // 5. get the STS token for the build formatted for our S3 lib
            var authorization = JSON.parse(new Buffer(build.loadpoint.authorization, 'base64'));
            
            // 6. upload files syncTree
            var directory = [tmpDir, build.id].join('/');
            var syncTree = require('../helpers/sync_tree');
            var sync = syncTree({
              clientOptions: {
                secretAccessKey: authorization.secret,
                accessKeyId: authorization.key,
                sessionToken: authorization.token,
                region: 'us-east-1',
                httpOptions: {
                  timeout: cli.timeout
                }
              },
              directory: [tmpDir, build.id].join('/'),
              bucket: process.env.DIVSHOT_HASHED_BUCKET,
              prefix: build.application_id
            });
  
            var inodeCount;
            var visitedCount = 0;
  
            var format = require('chalk');
            var progressBar;
            var ProgressBar = require('progress');
  
            function verbose() {
              // console.log.apply(console, arguments);
            }
  
            process.stdout.write('Hashing Directory Contents ...');
  
            sync.on('inodecount', function(count) {
              process.stdout.write(format.green(' ✔\n'));
              progressBar = new ProgressBar('Syncing '+ count +' inodes: [' + format.green(':bar') + '] ' + format.bold(':percent') + '', {
                complete: '=',
                incomplete: ' ',
                width: 50,
                total: count
              });
              inodeCount = count;
            });
  
            sync.on('notfound', function(path, hash) {
              verbose(format.red('404 ') + path);
            });
  
            sync.on('found', function(path, hash, count) {
              verbose(format.green('200 ') + path)
              visitedCount += count;
              progressBar.tick(count);
            });
  
            sync.on('cachestart', function(path, hash) {
              verbose(format.blue('PUT ') + path)
            });
  
            sync.on('cachesuccess', function(path, hash, count) {
              verbose(format.green('201 ') + path);
              visitedCount += 1;
              progressBar.tick(1);
            });
  
            sync.on('uploadstart', function(path, hash) {
              verbose(format.blue('PUT ') + path);
            });
  
            sync.on('uploadsuccess', function(path, hash) {
              verbose(format.green('201 ') + path);
              visitedCount += 1;
              progressBar.tick(1);
            });
  
            sync.on('uploadfailure', function(error) {
            });
  
            sync.on('retry', function(error) {
              visitedCount = 0;
              cli.log('');
              cli.log(format.red.underline(error.message));
              cli.log(format.green.underline('Retrying...'))
            });
  
            sync.on('error', function(error) {
              cli.log('');
              cli.log(format.red.underline(error.message));
              cli.log(error.stack);
              process.exit(1);
            });
  
            sync.on('synced', function(fileMap) {
              cli.log(format.green('Synced!'));
              verbose('inodeCount: ' + inodeCount, 'visitedCount: ' + visitedCount);
  
              var buildApi = cli.api.apps.id(config.name).builds.id(build.id);
              
              cli.log('');
              process.stdout.write('Finalizing build ... ');
  
              var url = buildApi.url() + '/finalize';
  
              buildApi.http.request(url, 'PUT', {json:{file_map: fileMap}}, function (err, response) {
                if (err) return done('error', err);
                if (response.statusCode < 200 || response.statusCode >= 300) {
                  var res = {};
  
                  try {res = JSON.parse(response.body);}
                  catch (e) {}
                  
                  cli.log();
                  return done(res.error);
                }
  
                cli.log(format.green('✔'));
                process.stdout.write('Releasing build to ' + format.bold(environment) + ' ... ');
  
                buildApi.release(environment, function (err, response) {
                  if (err) return done(err);
                  cli.log(format.green('✔'));
                  
                  return onPushed();
                });
              });
  
            });
          });
        });
      });
    }

    function onPushed () {
      var appUrl = (environment === 'production') 
        ? 'http://' + config.name + '.divshot.io'
        : 'http://' + environment + '.' + config.name + '.divshot.io';
      
      cli.log('');
      cli.log('Application deployed to ' + format.bold.white(environment), {success: true});
      cli.log('You can view your app at: ' + format.bold(appUrl), {success: true});
      
      done(null, appUrl);
    }
    
    function onError(err) {
      var errorMessage = err;
      
      if (_.isObject(err)) errorMessage = err.error;
      
      cli.log();
      
      done(errorMessage);
    }
  });
};
