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
var TEN_MB = 10000000;

var Deploy = function (options) {
  _.extend(this, options);
};

Deploy.prototype.initiate = function (callback) {
  var self = this;
  var files = {};
  var deployment;
  var requestOptions = {};
  
  if (this.build.error === 'invalid_token') return logger.error('You need to log in before you can do this');
  if (!this.build.id) return logger.error('You can\'t release an app that doesn\'t exist!');
  
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
  var uploadStream = deployment
    .pipe(request(requestOptions))
    .pipe(split(parseServerStream))
    .on('error', deploymentError)
    .on('data', deploymentData)
    .on('end', deploymentEnd);
  
  // New line delimted streaming json
  function parseServerStream (data) {
    if (!data) return;
    
    var parsed = JSUN.parse(data.toString());
    
    if (parsed.err) {
      logger.error(parsed.err);
      process.exit(1);
      return;
    }
    
    return parsed.json;
  }
  
  // Something bad happened
  function deploymentError (err) {
    logger.error(err);
    process.exit(1);
  }
  
  // Handle response event stream
  // We keep track of which files are unpacked/released
  function deploymentData (data) {
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
        logger.warn(data.data);
        break;
      case '_error':
        files[data.data.path].error = data.data;
        logger.error(data.data);
        break;
      case 'done':
        logger.info(format.blue('===> done.'));
        break;
    }
  }
  
  // At the end of it all, check that all packed files
  // were uploaded
  function deploymentEnd () {
    var unreleased = [];
    
    for(var key in files) {
      if(!files[key].released) {        
        files[key].path = key;
        unreleased.push(files[key]);
      }
    }

    if (unreleased.length > 0) {
      logger.error('ERROR: Not all files released!');
      logger.info(unreleased);
      callback(true);
      process.exit(1);
    }
    else {
      self.finalize(function (err) {
        callback(err);
        process.exit(err ? 1 : 0); // TODO: we shouldn't exit process in this class
      })
    }
  }
};

Deploy.prototype.finalize = function (callback) {
  logger.writeln('... ' + format.blue('done'));
  logger.writeln('Finalizing build ... ');
  
  var self = this;
  var build = this.ioApp.builds.id(this.build.id);
  
  build.finalize(function (err, response) {
    if (err) {
      logger.writeln();
      logger.error(err.message);
      process.exit(1);
      return; // TODO: need to call the callback wih the error and not exit here
    }
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      logger.write(format.blue('done'));
      logger.writeln('Releasing build to ' + format.bold(self.environment) + ' ...');
      
      self.release(callback);
    }
    else{
      logger.error('Unable to release build. Please try again');
      logger.error(response.headers);
      process.exit(1); // TODO: don't exit here
    }
  });
};

Deploy.prototype.release = function (callback) {
  var self = this;
  var stopLoading = loading();
  var build = this.ioApp.builds.id(this.build.id);
  
  build.release(this.environment, function (err, response) {
    if (err) {
      logger.error('Failure while releasing build: ' + err);
      process.exit(1); // TODO: don't exit here, just call callback
    }
    
    stopLoading();
    
    logger.write(format.blue('done') + '\n');
    logger.success('Appication deployed to ' + format.bold.white(self.environment));
    
    callback(err);
  });
};

Deploy.create = function (options) {
  return new Deploy(options);
};

Deploy.checkFileSizes = function (directory, callback) {
  shrub(directory)
    .filter(function (filePath, stats, next) {
      var file = filePath.replace(process.cwd() + '/', ''); // get relative path
      var shouldIgnore = ignoreGlobs.filter(function (glob) {
        return minimatch(file, glob);
      }).length;
      var tooBig = (shouldIgnore) ? false : stats.size > TEN_MB
      
      next(tooBig);
    })
    .then(function (filesTooBig) {
      if (filesTooBig.length) {
        logger.error(format.red('Files MUST NOT be greater than 10MB.'));
        filesTooBig.forEach(function (path) {
          logger.error(format.yellow(path) + ' is too big.');
        });
        
      }
      
      callback(filesTooBig.length);
    });
  
  // var tooBig = [];
  // file.walkSync(directory, function (dirPath, dirs, files) {
  //   files.forEach(function (file) {
  //     var glob;
  //     for (glob in ignoreGlobs) {
  //       if (minimatch(file, glob)) {
  //         return;
  //       }
  //     }
  //     if (fs.statSync(dirPath + '/' + file).size > TEN_MB) {
  //       tooBig.push(dirPath + '/' + file);
  //     }
  //   });
  // });

  // if (tooBig.length > 0) {
  //   logger.error(format.red('Files MUST NOT be greater than 10MB.'));
  //   tooBig.forEach(function (path) {
  //     logger.error(format.yellow(path) + ' is too big.');
  //   });
    
  //   process.exit(1);
  // }
};

module.exports = Deploy;