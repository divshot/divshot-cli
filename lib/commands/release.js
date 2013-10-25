var path = require('path');
var fs = require('fs');
var FormData = require('form-data');
var es = require('event-stream');
var streamDir = require('stream-dir');
var path = require("path");
var Request = require('request');
var fstream = require('fstream');
var tar = require('tar');
var zlib = require('zlib');
var http = require('http');
var cli = require('../divshot');
var logger = require('../logger');
var appConfig = require('../app_config');
var envConfig = require('../config/environments');

var internals = {
  files: []
};

internals.uploadFile = function (buildData, cwd) {
  return function (file, callback) {
    var key = file.replace(cwd, '');
    var form = new FormData();
    
    form.append('key', path.join(buildData.loadpoint.prefix, key));
    form.append('AWSAccessKeyId', buildData.loadpoint.fields.AWSAccessKeyId);
    form.append('policy', buildData.loadpoint.fields.policy);
    form.append('signature', buildData.loadpoint.fields.signature);
    form.append('file', fs.createReadStream(file));
    
    form.submit(buildData.loadpoint.url, function (err, response) {
      if (err) {
        logger.writeln();
        return logger.err(err.message);
      }
      
      logger.writeln('... ' + key);
      
      if (response.statusCode >= 200) {
      }
      callback(err, file);
    });
  };
};

internals.finalizeBuild = function (environment, build, callback) {
  return function (err) {
    logger.writeln('... ' + 'done'.blue);
    logger.writeln('Finalizing build ... ');
    
    build.finalize(function (err, response) {
      if (err) {
        logger.writeln();
        return logger.error(err.message);
      }
      
      if (response.statusCode >= 200) {
        logger.write('done'.blue);
        logger.writeln('Releasing build to ' + environment.bold + ' ... ');
        
        internals.releaseBuild(environment, build, callback);
      }
      else{
        logger.error('Unable to release build. Please try again');
      }
    });
  };
};

internals.releaseBuild = function (environment, build, callback) {
  build.release(environment, function (err, response) {
    logger.write('done'.blue + '\n');
    logger.writeln();
    logger.success('Application deployed to ' + environment.white.bold);
    
    callback(err);
  });
};

internals.initiateDeploy = function (app, environment, cwd, callback) {
  return function (err, buildData) {
    appConfig.getAll(function (error, config) {
      var publicDir = path.resolve(process.cwd(), config.root) || cwd;

      if (buildData.error === 'invalid_token') {
        logger.writeln();
        return logger.error('You need to log in before you can do this');
      }
      
      if (!buildData.id) {
        logger.writeln();
        logger.error('You can\'t release an app that doesn\'t exist!');
        return callback('NO_APP');
      }
      
      var build = app.builds.id(buildData.id);
      
      logger.write('done'.blue);
      logger.writeln('Deploying build ... ');

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
        .on('end', internals.finalizeBuild(environment, build, function (err) {
          process.exit(0);
        }))
        .pipe(process.stdout);
    });
  };
};

internals.forceEnvironment = function (callback) {
  return function (environment, cliCallback) {
    environment = environment || envConfig.default;
    
    if (envConfig.supported.indexOf(environment) > -1) {
      return callback(environment, cliCallback);
    }
    
    logger.error(environment + ' is an invalid release environment. Please use one of the following:')
    logger.info('- production');
    logger.info('- staging');
    logger.info('- development');
  };
};

var release = internals.forceEnvironment(function (environment, callback) {
  var cwd = process.cwd();
  var payload = (cli.config.get('m')) ? {message: cli.config.get('m')} : {};
  
  appConfig.getAll(function (err, config) {
    if (err) {
      return logger.error('Missing divshot.json file');
    }
    
    var app = cli.api.apps.id(config.name);
    
    logger.writeln('Creating build ... ');
    
    payload.config = config;
    app.builds.create(payload, internals.initiateDeploy(app, environment, cwd, callback));
  });
});

module.exports = release;
release.internals = internals;
release.usage = ['Release current app to and environment.'];



/*
  1. if user specifies --app parameter to ANY app-specific command, it should use that as the param
  2. if no param is specified, look for "name" field in divshot.json and use that
  3. if no "name" field, display error message
 */