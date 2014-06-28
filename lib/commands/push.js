var fs = require('fs-extra');
var path = require('path');
var upload = require('divshot-upload');
var bundleFiles = require('../helpers/bundle_files');
var format = require('chalk');
var _ = require('lodash');
var glob = require('glob');
var async = require('async');

module.exports = function (cli) {
  var command = cli.command('push <environment>');
  
  command.before('authenticate', 'isApp');
  command.description('deploy your app to the specified environment');
  command.handler(function (environment, done) {
    if (!environment) environment = 'development';
    
    var config = cli.cwd.getConfig();
    var appConfigRootPath = (config.root === '/') ? './' : config.root;
    var appRootDir = path.resolve(process.cwd(), appConfigRootPath);
    
    /*
    var uploadOptions = {
      type: 'tar',
      token: cli.user.get('token'),
      environment: environment,
      config: config,
      host: cli.api.options.host,
      files: {}
    };
    */
    
    if (!fs.existsSync(appRootDir)) return done(cli.errors.DIRECTORY_DOES_NOT_EXIST);
    
    if (environment === 'production') cli.log('\n' + format.yellow('Note:') + ' Deploying to production purges your application\'s CDN cache, which may take up to one minute.\n');
    
    // 1. glob directory appRootDir
    // 2. array subtract globs of config.excludes
    var globby = require('globby')
    var globs = [appRootDir + "/**"];
    if (config.exclude) {
      config.excludnpe.forEach(function(exclusion) {
        globs.push("!" + appRootDir + "/" + exclusion);                        
      });
    }
    var filesToUpload = globby.sync(globs);
    var tmp = require('tmp');
    
    // 4. Copy files (minus exclusions) to a tmp dir
    cli.api.apps.id(config.name).builds.create({config: config}, function(err, build){
      if (err) return done('Failed to initiate deploy: ' + err);
      if (build && build.status == 401) return done(build);
      if (!build || !build.loadpoint) return done('Failed to create deploy build');

      cli.log('Build created, preparing to upload files...');

      tmp.dir({unsafeCleanup:true}, function(err, tmpDir) {
        async.map(filesToUpload, function(src, callback){
          if (fs.statSync(src).isDirectory()) { callback(); return; };
          var dest = src.replace(appRootDir, tmpDir + "/" + build.id);

          fs.ensureFileSync(dest);
          fs.copySync(src, dest);
          callback();
        }, function() {

          // 5. get the STS token for the build formatted for our S3 lib
          var authorization = JSON.parse(new Buffer(build.loadpoint.authorization, 'base64'));

          // 6. upload files using intimidate

          var S3_BUCKET = "divshot-io-production";

          var uploadDir = require('../helpers/upload_dir');

          var clientOptions = {
            accessKeyId: authorization.key,
            secretAccessKey: authorization.secret,
            sessionToken: authorization.token            
          };
          var putOptions = {
            Bucket: S3_BUCKET
          };

          console.log(tmpDir + '/');
          var uploader = uploadDir(clientOptions, putOptions, tmpDir + '/');

          var ProgressBar = require('progress');
          var progressBar;
          uploader.on('uploaderror', function(data) {
            cli.log("Error while uploading " + data.path + " (will retry)");
          });
          uploader.on('uploadsuccess', function(data) {
            if(!progressBar) {
              progressBar = new ProgressBar('  deploying ' + data.total + ' files [:bar] :percent', {
                complete: '=',
                incomplete: ' ',
                width: 40,
                total: data.total
              });
            }
            progressBar.tick(1);
          });
          uploader.on('error', function(error) {
            cli.log(error);
            done("Failed to upload all files.");
            exit(1);
          });
          uploader.on('success', function() {
            // 7. finalize build  

            // 8. cut release

            console.log("\ndone uploading");
            var buildApi = cli.api.apps.id(config.name).builds.id(build.id);
            cli.log('Finalizing build ... ');

            buildApi.finalize(function (err, response) {
              if (err) return done('error', err);
              if (response.statusCode < 200 || response.statusCode >= 300) {
                var res = {};

                try {res = JSON.parse(response.body);}
                catch (e) {}

                return done(res.error);
              }

              cli.log('Build finalized');
              cli.log('Releasing build to ' + environment + ' ... ');

              buildApi.release(environment, function (err, response) {
                if (err) return done(err);
                cli.log('Build released');
                return done();
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