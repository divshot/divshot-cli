var fs = require('fs');
var _ = require('lodash');
var logger = require('feedback');
var format = require('chalk');
var argv = require('optimist').argv;
var ignoreGlobs = require('superstatic').ignore.globs;
var JSUN = require('JSUN');
var request = require('request');
var split = require('split');
var shrub = require('shrub');
var sizer = require('sizer');
var tarzan = require('tarzan');
var TEN_MB = 10000000;

var Build = function (options) {
  this._appRootDir = options.appRootDir;
  this._appConfig = options.appConfig;
  this._buildData = options.buildData;
  
  this.app = options.app;
  this.build = this.app.builds.id(this._buildData.id);
  this.environment = options.environment;
  
  this._files = {};
  this._requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      Authorization: this._buildData.loadpoint.authorization
    }
  };
};

Build.prototype.package = function (callback) {
  var self = this;
  var deployment;
  
  if (this._buildData.error === 'invalid_token') return callback('You need to log in before you can do this');
  if (!this._buildData.id) return callback('You can\'t release an app that doesn\'t exist!');
  
  logger.info(format.blue('done'));
  logger.info('Deploying build ... ');
  
  if (argv.zip) {
    deployment = argv.zip;
    
    this._requestOptions.url = this._buildData.loadpoint.zip_url;
  }
  else if (argv.file) {
    deployment = argv.file;
    
    this._requestOptions.url = this._buildData.loadpoint.put_url + '/' + deployment.path.replace(this._appRootDir, '');
    this._requestOptions.headers['Content-Length'] = fs.lstatSync(deployment.path).size;
  }
  else {
    this._requestOptions.url = this._buildData.loadpoint.tar_url;
    
    var exclude = _.defaults(this._appConfig, {exclude: []}).exclude;
    deployment = tarzan({
      directory: this._appRootDir,
      ignore: _.union(ignoreGlobs, exclude)
    });
  }
  
  return deployment
    .pipe(request(this._requestOptions))
    .pipe(split(this._parseServerStream))
    .on('error', callback)
    .on('data', this._deploymentData(this._files))
    .on('end', this._deploymentEnd(this._files, callback));
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
Build.prototype._deploymentEnd = function (files, callback) {
  var self = this;
  
  return function () {
    var unreleased = [];
    
    for(var key in files) {
      if(!files[key].released) {        
        files[key].path = key;
        unreleased.push(files[key]);
      }
    }

    if (unreleased.length > 0) {
      logger.info(unreleased);
      return callback('ERROR: Not all files released!');
    }
    
    callback();
  };
};

Build.prototype.finalize = function (callback) {
  logger.writeln('... ' + format.blue('done'));
  logger.writeln('Finalizing build ... ');
  
  var build = this;
  
  return this.app.builds.id(this._buildData.id).finalize(function (err, response) {
    if (err) return callback(err.message);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      logger.write(format.blue('done'));
      logger.writeln('Releasing build to ' + format.bold(build.environment) + ' ...');
      
      callback();
    }
    else{
      callback('Unable to release build. Please try again. ' + response.headers);
    }
  });
};

Build.prototype.release = function (callback) {
  var build = this;
  
  this.build.release(this.environment, function (err, response) {
    if (err) return callback('Failure while releasing build: ' + err);
    
    logger.write(format.blue('done') + '\n');
    logger.success('Appication deployed to ' + format.bold.white(build.environment));
    
    callback();
  });
};

Build.create = function (options) {
  return new Build(options);
};

Build.checkFileSizes = function (directory, callback) {
  sizer.bigger(TEN_MB, directory, ignoreGlobs, function (err, files) {
    if (files.length) {
      logger.error(format.red('Files MUST NOT be greater than 10MB.'));
      files.forEach(function (file) {
        logger.error(format.yellow(file) + ' is too big.');
      });
    }
    
    callback(files.length);
  });
};

module.exports = Build;