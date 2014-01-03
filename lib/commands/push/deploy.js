var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var logger = require('feedback');
var format = require('chalk');
var argv = require('optimist').argv;
var tar = require('tar');
var zlib = require('zlib');
var Ignore = require('fstream-ignore');
var ignoreGlobs = require('superstatic').ignore.globs;
var loading = require('../../helpers/loading');
var JSUN = require('JSUN');
var request = require('request');
var split = require('split');
var minimatch = require('minimatch');
var file = require('file');
var shrub = require('shrub');
var sizer = require('sizer');
var TEN_MB = 10000000;

var Deploy = function (options) {
  _.extend(this, options);
};

Deploy.prototype.initiate = function (callback) {
  var self = this;
  var files = {};
  var deployment;
  var requestOptions = {};
  
  if (this.build.error === 'invalid_token') return callback('You need to log in before you can do this');
  if (!this.build.id) return callback('You can\'t release an app that doesn\'t exist!');
  
  // This gets passed to the finalization. We should just call this
  // method in that function call
  // var build = this.ioApp.builds.id(this.build.id);
  
  logger.info(format.blue('done'));
  logger.info('Deploying build ... ');
  
  requestOptions.method = 'PUT';
  requestOptions.headers = {
    'Content-Type': 'application/octet-stream',
    Authorization: this.build.loadpoint.authorization
  };
  
  if (argv.zip) {
    deployment = argv.zip;
    requestOptions.url = this.build.loadpoint.zip_url;
  }
  else if (argv.file) {
    deployment = argv.file;
    requestOptions.url = this.build.loadpoint.put_url + '/' + deployment.path.replace(this.appRootDir, '');
    requestOptions.headers['Content-Length'] = fs.lstatSync(deployment.path).size;
  }
  else {
    // Pipe app directory into tar.gz stream
    // We keep track of files by name as they
    // are packed into the stream.
    var reader = new Ignore({
      path: this.appRootDir,
      type:'Directory'
    });
    
    // Ignore these list of globs
    var exclude = _.defaults(this.config, {exclude: []}).exclude;
    reader.addIgnoreRules(_.union(ignoreGlobs, exclude));
    
    deployment = reader
      .pipe(tar.Pack({
        pathFilter: function(path) {
          if(fs.lstatSync(path).isFile()) {          
            files[path.replace(self.appRootDir + '/', '')] = {};
          }
          
          return path.replace(self.appRootDir + '/', '');
        }
      }))
      .pipe(zlib.Gzip());

    requestOptions.url = this.build.loadpoint.tar_url;
  }
  
  // Upload the deployment tar (packed) to the api
  deployment
    .pipe(request(requestOptions))
    .pipe(split(this._parseServerStream))
    .on('error', callback)
    .on('data', this._deploymentData(files))
    .on('end', this._deploymentEnd(files, callback));
};

// New line delimted streaming json
Deploy.prototype._parseServerStream = function (data) {
  if (!data) return;
  
  var parsed = JSUN.parse(data.toString());
  
  if (parsed.err) {
    logger.error(parsed.err);
    process.exit(1);
    return;
  }
  
  return parsed.json;
};

// Handle response event stream
// We keep track of which files are unpacked/released
Deploy.prototype._deploymentData = function (files) {
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
Deploy.prototype._deploymentEnd = function (files, callback) {
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
    
    self.finalize(callback);
  };
};

Deploy.prototype.finalize = function (callback) {
  logger.writeln('... ' + format.blue('done'));
  logger.writeln('Finalizing build ... ');
  
  var self = this;
  var build = this.ioApp.builds.id(this.build.id);
  
  build.finalize(function (err, response) {
    if (err) return callback(err.message);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      logger.write(format.blue('done'));
      logger.writeln('Releasing build to ' + format.bold(self.environment) + ' ...');
      
      self.release(callback);
    }
    else{
      callback('Unable to release build. Please try again. ' + response.headers);
    }
  });
};

Deploy.prototype.release = function (callback) {
  var self = this;
  var stopLoading = loading();
  var build = this.ioApp.builds.id(this.build.id);
  
  build.release(this.environment, function (err, response) {
    stopLoading();
    
    if (err) return callback('Failure while releasing build: ' + err);
    
    logger.write(format.blue('done') + '\n');
    logger.success('Appication deployed to ' + format.bold.white(self.environment));
    
    callback();
  });
};

Deploy.create = function (options) {
  return new Deploy(options);
};

Deploy.checkFileSizes = function (directory, callback) {
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

module.exports = Deploy;