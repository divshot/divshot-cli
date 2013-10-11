var path = require('path');
var FormData = require('form-data');
var fs = require('fs');
var path = require('path');
var es = require('event-stream');
var cli = require('../divshot');
var streamDir = require('stream-dir');
var async = require('async');
var logger = require('../logger');

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
      if (response.statusCode >= 200) {
        
        logger.write('done'.blue);
        logger.writeln('Releasing build to ' + environment.bold + ' ... ');
        
        internals.releaseBuild(environment, build, callback);
      }
    });
  };
};

internals.releaseBuild = function (environment, build, callback) {
  build.release(environment, function (err, response) {
    logger.write('done'.blue);
    logger.writeln('\nApplication deployed to '.green + environment.white.bold + '\n');
    
    callback(err);
  });
};

internals.initiateDeploy = function (app, environment, cwd, callback) {
  return function (err, buildData) {
    if (!buildData.id) {
      logger.writeln('ERROR: '.red + 'You can\'t release an app that doesn\'t exist!\n');
      return callback('NO_APP');
    }
    
    var build = app.builds.id(buildData.id);
    
    logger.write('done'.blue);
    logger.writeln('Deploying build ... ');
    
    streamDir(cwd)
      .pipe(es.map(internals.uploadFile(buildData, cwd)))
      .on('end', internals.finalizeBuild(environment, build, function (err) {
        process.exit(0);
      }));
  };
};

var release = function (environment, callback) {
  var cwd = process.cwd();
  var config = require(path.join(cwd, 'divshot.json'));
  var app = cli.api.apps.id(config.name);
  
  logger.writeln('Creating build ... ');
  
  app.builds.create(
    { message: config.name }, // TODO: Need an stdin
    internals.initiateDeploy(app, environment, cwd, callback)
  );
};

module.exports = release;
release.internals = internals;
release.usage = ['Release current app to and environment.'];





/*
  1. if user specifies --app parameter to ANY app-specific command, it should use that as the param
  2. if no param is specified, look for "id" field in divshot.json and use that
  3. if no "id" field is found, look for "name" field in divshot.json
  4. if no "name" field, display error message
 */