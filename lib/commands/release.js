var path = require('path');
var fs = require('fs');
var FormData = require('form-data');
var es = require('event-stream');
var streamDir = require('stream-dir');
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
      console.log(response.statusCode);
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
    logger.write('done'.blue + '\n');
    logger.writeln();
    logger.success('Application deployed to ' + environment.white.bold);
    
    callback(err);
  });
};

internals.initiateDeploy = function (app, environment, cwd, callback) {
  return function (err, buildData) {
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
    
    streamDir(cwd)
      .pipe(es.map(internals.uploadFile(buildData, cwd)))
      .on('end', internals.finalizeBuild(environment, build, function (err) {
        process.exit(0);
      }));
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
    
    app.builds.create(
      payload,
      internals.initiateDeploy(app, environment, cwd, callback)
    );
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