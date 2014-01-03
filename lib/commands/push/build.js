var fs = require('fs');
var _ = require('lodash');
var logger = require('feedback');
var format = require('chalk');
var argv = require('optimist').argv;
var JSUN = require('JSUN');
var request = require('request');
var split = require('split');
var shrub = require('shrub');
var sizer = require('sizer');
var ignoreGlobs = require('superstatic').ignore.globs;
var TEN_MB = 10000000;

var Deployment = require('./deployment');

var Build = function (options) {
  this._appRootDir = options.appRootDir;
  this._appConfig = options.appConfig;
  this._buildData = options.buildData;
  
  this.app = options.app;
  this.build = this.app.builds.id(this._buildData.id);
  this.environment = options.environment;
  
  this._files = {};
};

Build.prototype.package = function (done) {
  var deployment = new Deployment(argv, this._buildData.loadpoint, this.exclude());
  
  return deployment.push(this._appRootDir)
    .pipe(request(deployment._requestOptions))
    .pipe(split(this._parseServerStream))
    .on('error', done)
    .on('data', this._deploymentData(this._files))
    .on('end', this._deploymentEnd(this._files, done));
};

// New line delimted streaming json
Build.prototype._parseServerStream = function (data) {
  if (!data) return;
  
  var parsed = JSUN.parse(data.toString());
  if (parsed.err) throw new Error(parsed.err);
  
  return parsed.json;
};

// Handle response event stream
// We keep track of which files are unpacked/released
Build.prototype._deploymentData = function (files) {
  return function (data) {
    switch (data.event) {
      case 'unpack':
        files[data.data.path] || (files[data.data.path] = {}); // for zip uploads
        files[data.data.path].unpacked = true;
        break;
      case 'released':
        files[data.data.path].released = true;
        logger.success(data.data.path);
        break;
      case 'message':
        logger.info(data.data);
        break;
      case '_error':
        files[data.data.path].error = data.data;
        logger.error(data.data);
        break;
      case 'done':
        logger.info(format.blue('===> done.'));
        break;
    }
  };
};

// At the end of it all, check that all packed files
// were uploaded
Build.prototype._deploymentEnd = function (files, done) {
  return function () {
    var unreleased = Object.keys(files)
      .filter(function (key) {
        return !files[key].released;
      })
      .map(function (key) {
        files[key].path = key;
        return files[key];
      });
    
    done(null, unreleased);
  };
};

Build.prototype.finalize = function (done) {
  return this.app.builds.id(this._buildData.id).finalize(function (err, response) {
    if (err) return done(err.message);
    if (response.statusCode >= 200 && response.statusCode < 300) return done();
    
    done('Unable to release build. Please try again. ' + response.headers);
  });
};

Build.prototype.release = function (done) {
  this.build.release(this.environment, function (err, response) {
    done((err) ? 'Failure while releasing build: ' + err : undefined);
  });
};

Build.prototype.exclude = function () {
  return this._appConfig.exclude || [];
};

Build.create = function (options) {
  return new Build(options);
};

Build.checkFileSizes = function (directory, done) {
  sizer.bigger(TEN_MB, directory, ignoreGlobs, function (err, files) {
    if (files.length) {
      logger.error(format.red('Files MUST NOT be greater than 10MB.'));
      files.forEach(function (file) {
        logger.error(format.yellow(file) + ' is too big.');
      });
    }
    
    done(files.length);
  });
};

module.exports = Build;