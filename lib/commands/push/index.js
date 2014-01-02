var fs = require('fs');
var path = require('path');
var fstream = require('fstream');
var request = require('request');
var tar = require('tar');
var zlib = require('zlib');
var http = require('http');
var fs = require('fs');
var ignoreGlobs = require('superstatic').ignore.globs;
var Ignore = require('fstream-ignore');
var file = require('file');
var through = require('through');
var minimatch = require('minimatch');
var JSUN = require('jsun');
var split = require('split');
var through = require('through');
var TEN_MB = 10000000;

module.exports = function (app) {
  app.program
    .command('push')
    .description('deploy your app to the specified environment')
    .example('push [environment]')
    .option('-z, --zip <zipfile>', 'upload a zip file instead of a tar (for testing/diagnostics)', readStream)
    .option('-f, --file <file>', 'PUT a single file (for testing/diagnostics)', readStream)
    .withAuth()
    .withConfig()
    .handler(function () {
      var environment = (arguments.length > 1) ? arguments[0] : 'development';
      var config = this.config;
      var payload = {}; // TODO: allow user to add a message to this deploy with flag -m
      var ioApp = app.api.apps.id(config.name);
      var publicDir = path.resolve(process.cwd(), config.root);      
      
      checkFileSizes(app, publicDir);

      app.logger.writeln('Creating build ... ');
      
      payload.config = config;
      ioApp.builds.create(payload, initiateDeploy(app, ioApp, environment, process.cwd(), publicDir, function (err) {
        if (err) {
          app.logger.error('Failed while creating build: ' + err);
          process.exit(1);
        }
        app.logger.writeln();
        app.logger.info('You can view your app at: ' + app.format.bold('http://') + app.format.bold(environment) + app.format.bold('.') + app.format.bold(config.name) + app.format.bold('.divshot.io'));
      }));
    });
};

function initiateDeploy (app, ioApp, environment, cwd, publicDir, callback) {
  return function (err, buildData) {
    if (err) {
      app.logger.error('Failed to initiate deploy: ' + err);
      process.exit(1);
    }

    var config = app.cwd.getConfig();
    var files = {};
    var deployment;
    var requestOptions = {};
    
    if (buildData.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');
    if (!buildData.id) return app.logger.error('You can\'t release an app that doesn\'t exist!');
    
    var build = ioApp.builds.id(buildData.id);
    
    app.logger.info(app.format.blue('done'));
    app.logger.info('Deploying build ... ');
    
    requestOptions.method = 'PUT';
    requestOptions.headers = {
      'Content-Type': 'application/octet-stream',
      Authorization: buildData.loadpoint.authorization
    };
    
    if (shouldUploadZip(app)) {
      deployment = app.program.args[0].zip;
      requestOptions.url = buildData.loadpoint.zip_url;
    }
    else if (shouldUploadSingleFile(app)) {
      deployment = app.program.args[0].file;
      requestOptions.url = buildData.loadpoint.put_url + '/' + deployment.path.replace(publicDir, '');
      requestOptions.headers['Content-Length'] = fs.lstatSync(deployment.path).size;
    }
    else {
      // Pipe app directory into tar.gz stream
      // We keep track of files by name as they
      // are packed into the stream.
      var reader = new Ignore({
        path: publicDir,
        type:'Directory'
      });
        
      // Ignore these list of globs
      var exclude = app._.defaults(config, {exclude: []}).exclude;
      reader.addIgnoreRules(app._.union(ignoreGlobs, exclude));
      
      deployment = reader
        .pipe(tar.Pack({
          pathFilter: function(path) {
            if(fs.lstatSync(path).isFile()) {          
              files[path.replace(publicDir + '/', '')] = {};
            }
            
            return path.replace(publicDir + '/', '');
          }
        }))
        .pipe(zlib.Gzip());

      requestOptions.url = buildData.loadpoint.tar_url;
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
        app.logger.error(parsed.err);
        process.exit(1);
        return;
      }
      
      return parsed.json;
    }
    
    // Something bad happened
    function deploymentError (err) {
      app.logger.error(err);
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
          app.logger.success(data.data.path);
          break;
        case 'message':
          app.logger.warn(data.data);
          break;
        case '_error':
          files[data.data.path].error = data.data;
          app.loggger.error(data.data);
          break;
        case 'done':
          app.logger.info(app.format.blue('===> done.'));
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
        app.logger.error('ERROR: Not all files released!');
        app.logger.info(unreleased);
        callback(true);
        process.exit(1);
      }
      else {
        finalizeBuild(app, environment, build, function(error) {
          callback(error);
          process.exit(error ? 1 : 0);
        })();
      }
    }
    
  };
}

function finalizeBuild (app, environment, build, callback) {
  return function (err) {
    app.logger.writeln('... ' + app.format.blue('done'));
    app.logger.writeln('Finalizing build ... ');
    
    build.finalize(function (err, response) {
      if (err) {
        app.logger.writeln();
        app.logger.error(err.message);
        process.exit(1);
        return;
      }
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        app.logger.write(app.format.blue('done'));
        app.logger.writeln('Releasing build to ' + app.format.bold(environment) + ' ...');
        
        releaseBuild(app, environment, build, callback);
      }
      else{
        app.logger.error('Unable to release build. Please try again');
        app.logger.error(response.headers);
        process.exit(1);
      }
    });
  };
}

function releaseBuild (app, environment, build, callback) {
  var stopLoading = app.loading();
  
  build.release(environment, function (err, response) {
    if (err) {
      app.logger.error('Failure while releasing build: ' + err);
      process.exit(1);
    }
    stopLoading();
    
    app.logger.write(app.format.blue('done') + '\n');
    app.logger.success('Application deployed to ' + app.format.bold.white(environment));
    
    callback(err);
  });
}

function checkFileSizes (app, directory) {
  var tooBig = [];
  file.walkSync(directory, function (dirPath, dirs, files) {
    files.forEach(function (file) {
      var glob;
      for (glob in ignoreGlobs) {
        if (minimatch(file, glob)) {
          return;
        }
      }
      if (fs.statSync(dirPath + '/' + file).size > TEN_MB) {
        tooBig.push(dirPath + '/' + file);
      }
    });
  });

  if (tooBig.length > 0) {
    app.logger.error(app.format.red('Files MUST NOT be greater than 10MB.'));
    tooBig.forEach(function (path) {
      app.logger.error(app.format.yellow(path) + ' is too big.');
    });
    
    process.exit(1);
  }
}

function readStream (value) {
  return fs.createReadStream(value);
}

function shouldUploadZip (app) {
  return app.program.args[0].zip;
}

function shouldUploadSingleFile (app) {
  return app.program.args[0].file;
}