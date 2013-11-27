var fs = require('fs');
var path = require('path');
var fstream = require('fstream');
var requestModule = require('request');
var tar = require('tar');
var zlib = require('zlib');
var http = require('http');
var eventStream = require('event-stream');
var fs = require('fs');
var ignoreGlobs = require('superstatic').ignore.globs;
var Ignore = require('fstream-ignore');
var file = require('file');
var through = require('through');
var minimatch = require('minimatch');
var TEN_MB = 1000000;

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
        app.logger.info('You can view your app at: ' + 'http://'.bold + environment.bold + '.'.bold + config.name.bold + '.divshot.io'.bold);
      }));
    });
};

function readStream (value) {
  return fs.createReadStream(value);
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
    app.logger.error('Files MUST NOT be greater than 10MB.'.red);
    tooBig.forEach(function (path) {
      app.logger.error(path.yellow + ' is too big.');
    });
    
    process.exit(1);
  }
}

function initiateDeploy (app, ioApp, environment, cwd, publicDir, callback) {
  return function (err, buildData) {
    if (err) {
      app.logger.error('Failed to initiate deploy: ' + err);
      process.exit(1);
    }

    var config = app.cwd.getConfig();
    
    
    if (buildData.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');
    if (!buildData.id) return app.logger.error('You can\'t release an app that doesn\'t exist!');
    
    var build = ioApp.builds.id(buildData.id);
    
    app.logger.info('done'.blue);
    app.logger.info('Deploying build ... ');

    
    var files = {};

    var requestOptions = {};
    requestOptions.method = 'PUT';
    requestOptions.headers = {
      'Content-Type': 'application/octet-stream',
      Authorization: buildData.loadpoint.authorization
    };
    
    var deployment;
    
    if (app.program.args[0].zip) {
      deployment = app.program.args[0].zip;
      requestOptions.url = buildData.loadpoint.zip_url;
    }
    else if (app.program.args[0].file) {
      deployment = app.program.args[0].file;
      requestOptions.url = buildData.loadpoint.put_url + '/' + deployment.path.replace(publicDir, '');
      requestOptions.headers['Content-Length'] = fs.lstatSync(deployment.path).size;
    }
    else {
      // Pipe app directory into tar.gz stream
      // We keep track of files by name as they
      // are packed into the stream.
      var reader = new Ignore({
        path: publicDir, type:'Directory'
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
  
    var request = requestModule(requestOptions);

    // Pipe the deployment over http request
    deployment
      .pipe(request)

    // Pipe http response into eventStream splitter/parser
    //  (parses json object per-line of response)
      .pipe(eventStream.split())
      .pipe(eventStream.through(function (data) {
          var obj;
          try {
            if(data) {
              obj = JSON.parse(data.toString());
            }
          } catch (err) {
            console.error(data.red);
            process.exit(1);
          }
          //ignore lines that where only whitespace.
          if(obj !== undefined) {
            this.emit('data', obj);
          }
      }))

    // Handle response event stream
    // We keep track of which files are unpacked/released
      .on('error', function(error) {
        console.error(error);
        process.exit(1);
      })
      .on('data', function(data){
        switch (data.event) {
          case 'unpack':
            files[data.data.path] || (files[data.data.path] = {}); // for zip uploads
            files[data.data.path].unpacked = true;
            break;
          case 'released':
            files[data.data.path].released = true;
            console.log('===> Released '.green + data.data.path);
            break;
          case 'message':
            console.log('===> '.yellow + data.data);
            break;
          case '_error':
            files[data.data.path].error = data.data;
            console.error('===> ERROR '.red);
            console.error(data.data);
            break;
          case 'done':
            console.log('===> done.'.blue);
            break;
        }
      })

    // At the end of it all, check that all packed files
    // were uploaded
    .on('end', function () {
      var unreleased = [];
      var key;
      
      for(key in files) {
        if(!files[key].released) {        
          files[key].path = key;
          unreleased.push(files[key]);
        }
      }

      if (unreleased.length > 0) {
        callback(true);
        console.error('ERROR: Not all files released!'.red);
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
        app.logger.error(err.message);
        process.exit(1);
        return;
      }
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        app.logger.write('done'.blue);
        app.logger.writeln('Releasing build to ' + environment.bold + ' ...');
        
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
    
    app.logger.write('done'.blue + '\n');
    app.logger.success('Application deployed to ' + environment.white.bold);
    
    callback(err);
  });
}