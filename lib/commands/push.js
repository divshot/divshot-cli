var fs = require('fs-extra');
var path = require('path');
var upload = require('divshot-upload');
var format = require('chalk');
var _ = require('lodash');
var glob = require('glob');
var async = require('async');
var tmp = require('tmp');
var ProgressBar = require('progress');
var globby = require('globby');
var bundleFiles = require('../helpers/bundle_files');
var uploadDir = require('../helpers/upload_dir');
var format = require('chalk');

module.exports = function (cli) {
  var command = cli.command('push <environment>');
  
  command.before('authenticate', 'isApp');
  command.description('deploy your app to the specified environment');
  command.handler(function (environment, done) {
    if (!environment) environment = 'development';
    
    var config = cli.cwd.getConfig();
    var appConfigRootPath = (config.root === '/') ? './' : config.root;
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
    
    // 4. Copy files (minus exclusions) to a tmp dir
    cli.api.apps.id(config.name).builds.create({config: config}, function(err, build){
      if (err) return done('Failed to initiate deploy: ' + err);
      if (build && build.status) {
        cli.log('');
        return done(JSON.stringify(build, null, 4));
      }
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
          if (fs.statSync(src).isDirectory()) { callback(); return; };
          var dest = src.replace(appRootDir, tmpDir + "/" + build.id);

          fs.ensureFileSync(dest);
          fs.copySync(src, dest);
          callback();
        }, function() {

          // 5. get the STS token for the build formatted for our S3 lib
          var authorization = JSON.parse(new Buffer(build.loadpoint.authorization, 'base64'));

          // 6. upload files syncTree

          var syncTree = require('../helpers/sync_tree');
          var sync = syncTree({
            clientOptions: {
              secretAccessKey: authorization.secret,
              accessKeyId: authorization.key,
              sessionToken: authorization.token,
              region: 'us-east-1',
              httpOptions: {
                timeout: 1500
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


            // console.log(url, buildApi.http.request.toString());
            // console.log(fileMap);
            // process.exit(1);
            buildApi.http.request(url, 'PUT', {form:{file_map: fileMap}}, function (err, response) {
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
    
    //console.log(filesToUpload);
    //process.exit(1);
    // 3. create a build
 
    
    
//     bundleFiles(appRootDir, config.exclude)
//       .on('file', trackFile)
//       .pipe(upload(uploadOptions))
//         .on('message', onMessage)
//         .on('released', onReleased)
//         .on('releasing', onReleasing)
//         .on('loading', onLoading)
//         .on('pushed', onPushed)
//         .on('unreleased', onUnreleased)
//         .on('error', onError);
    
    var needsNewline = false;
    
    function trackFile (file) {
      uploadOptions.files[file.relative] = {};
    }
    
    function onMessage (msg) {
      if (needsNewline) { process.stdout.write("\n\n"); needsNewline = false; }
      cli.log(msg);
    }
    
    function onReleased (msg) {
      process.stdout.write(format.green('.'));
      needsNewline = true;
    }
    
    function onReleasing () {
      cli.log('Releasing build...');
    }
    
    function onLoading () {
      cli.log('.'); // TODO: implement this
    }
    
    function onPushed () {
      var appUrl = (environment === 'production') 
        ? 'http://' + config.name + '.divshot.io'
        : 'http://' + environment + '.' + config.name + '.divshot.io';
      
      cli.log('');
      cli.log('Application deployed to ' + format.bold.white(environment), {success: true});
      cli.log('You can view your app at: ' + format.bold(appUrl), {success: true});
      done(null, appUrl);
      
      process.exit(0);
    }
    
    function onUnreleased (unreleasedFiles) {
      cli.log("\n");
      
      unreleasedFiles.forEach(function (file) {
        cli.log(format.red('Error:') + ' Failed to release ' + file.path);
      });
      cli.log();
      
      done(cli.errors.FILES_NOT_RELEASED);
    }
    
    function onError(err) {
      var errorMessage = err;
      if (_.isObject(err)) errorMessage = err.error;
      done(errorMessage);
    }
  });
};
