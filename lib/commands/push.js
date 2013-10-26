var path = require('path');
var fstream = require('fstream');
var Request = require('request');
var tar = require('tar');
var zlib = require('zlib');
var http = require('http');

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
    
    app.logger.write('done'.blue);
    app.logger.writeln('Deploying build ... ');
    
    var reader = fstream.Reader({
      path: publicDir, type:'Directory'
    });
    
    var requestOptions = {};
    requestOptions.method = "PUT";
    requestOptions.headers = {
      "Content-Type": 'application/octet-stream',
      Authorization: buildData.loadpoint.authorization
    }
    
    var request = http.request(requestOptions);
    reader
      .pipe(tar.Pack({
        pathFilter: function(path) {
          return path.replace(publicDir + "/", '');
        }
      }))
      .pipe(zlib.Gzip())
      .pipe(Request.put(buildData.loadpoint.tar_url, requestOptions))
      .on('end', finalizeBuild(app, environment, build, function (err) {
        callback(err);
        process.exit(0);
      }))
      .pipe(process.stdout);
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