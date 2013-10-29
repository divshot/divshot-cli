var fs = require('fs');
var path = require('path');
var fstream = require('fstream');
var Request = require('request');
var tar = require('tar');
var zlib = require('zlib');
var http = require('http');
var eventStream = require('event-stream');
var fs = require('fs');
var ignoreGlobs = require('superstatic').ignore.globs
var Ignore = require("fstream-ignore")

module.exports = function (app) {
  app.program
    .command('push')
    .description('deploy your divshot.io app')
    .action(function () {
      var environment = (arguments.length > 1) ? arguments[0] : 'production';
      var config = app.cwd.getConfig();
      var payload = {}; // TODO: allow user to add a message to this deploy with flag -m
      
      if (!config) return app.logger.error('You can\'t release an app that doesn\'t exist!');
      
      var ioApp = app.api.apps.id(config.name);
      
      app.logger.writeln('Creating build ... ');
      
      payload.config = config
      ioApp.builds.create(payload, initiateDeploy(app, ioApp, environment, process.cwd(), function (err) {
        app.logger.writeln();
        app.logger.info('You can view your app at: ' + 'http://'.bold + environment.bold + '.'.bold + config.name.bold + '.divshot.io'.bold);
      }));
    });
};

function initiateDeploy (app, ioApp, environment, cwd, callback) {
  return function (err, buildData) {
    var config = app.cwd.getConfig();
    var publicDir = path.resolve(process.cwd(), config.root) || cwd;
    
    if (buildData.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');
    if (!buildData.id) return app.logger.error('You can\'t release an app that doesn\'t exist!');
    
    var build = ioApp.builds.id(buildData.id);
    
    app.logger.info('done'.blue);
    app.logger.info('Deploying build ... ');
    
    var reader = new Ignore({
      path: publicDir, type:'Directory'
    });
    
    reader.addIgnoreRules(ignoreGlobs);

    var requestOptions = {};
    requestOptions.url = buildData.loadpoint.tar_url;
    requestOptions.method = "PUT";
    requestOptions.headers = {
      "Content-Type": 'application/octet-stream',
      Authorization: buildData.loadpoint.authorization
    }
    
    var request = Request(requestOptions);
    var files = {};

    // Pipe app directory into tar.gz stream
    // We keep track of files by name as they
    // are packed into the stream.
    reader
      .pipe(tar.Pack({
        pathFilter: function(path) {
          if(fs.lstatSync(path).isFile()) {          
            files[path.replace(publicDir + "/", '')] = {};
          }
          return path.replace(publicDir + "/", '');
        }
      }))
      .pipe(zlib.Gzip())

    // Pipe tar.gz stream over http request
      .pipe(request)

    // Pipe http response into eventStream splitter/parser
    //  (parses json object per-line of response)
      .pipe(eventStream.split())
      .pipe(eventStream.parse())

    // Handle response event stream
    // We keep track of which files are unpacked/released
      .on('data', function(data){
        switch (data.event) {
          case 'unpack':
            files[data.data.path].unpacked = true;
            break;
          case 'progress':
          break;
          case 'released':
            files[data.data.path].released = true;
            console.log("===> Released ".green + data.data.path);
            break;
          case 'message':
            console.log("===> ".yellow + data.data);
            break;
          case 'error':
            files[data.data.path].error = data.data;
            console.error("===> ERROR ".red);
            console.error(data.data);
            break;
          case 'done':
            console.log("===> done.".blue)
            break;
        }
      })

    // At the end of it all, check that all packed files
    // were uploaded
    .on('end', function () {
      var unreleased = [];
      for(key in files) {
        if(!files[key].released) {        
          files[key].path = key;
          unreleased.push(files[key]);
        }
      }

      if (unreleased.length > 0) {
        callback(true);
        console.error("ERROR: Not all files released!".red);
        console.dir(unreleased);
        process.exit(1);
      }
      else {
        finalizeBuild(app, environment, build, function(error) {
          callback(error);
          process.exit(error ? 1 : 0);
        })();
      }
    });

  };
}

function finalizeBuild (app, environment, build, callback) {
  return function (err) {
    app.logger.writeln('... ' + 'done'.blue);
    app.logger.writeln('Finalizing build ... ');
    
    build.finalize(function (err, response) {
      if (err) {
        app.logger.writeln();
        return app.logger.error(err.message);
      }
      
      if (response.statusCode >= 200) {
        app.logger.write('done'.blue);
        app.logger.writeln('Releasing build to ' + environment.bold + ' ... ');
        
        releaseBuild(app, environment, build, callback);
      }
      else{
        app.logger.error('Unable to release build. Please try again');
      }
    });
  };
}

function releaseBuild (app, environment, build, callback) {
  build.release(environment, function (err, response) {
    app.logger.write('done'.blue + '\n');
    app.logger.success('Application deployed to ' + environment.white.bold);
    
    callback(err);
  });
}