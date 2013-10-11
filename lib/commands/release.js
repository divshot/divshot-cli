var path = require('path');
var FormData = require('form-data');
var fs = require('fs');
var path = require('path');
var cli = require('../divshot');
var streamDir = require('stream-dir');
var async = require('async');

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
      process.stdout.write('\n... ' + key);
      if (response.statusCode >= 200) {
      }
      callback();
    });
  };
};

internals.finalizeRelease = function (environment, build, callback) {
  return function (err) {
    process.stdout.write('\n... ' + 'done'.blue);
    process.stdout.write('\nFinalizing build ... ');
    
    build.finalize(function (err, response) {
      if (response.statusCode >= 200) {
        process.stdout.write('done'.blue);
        process.stdout.write('\nReleasing build to ' + environment.bold + ' ... ');
        
        // 4. Release [POST]
        build.release(environment, function (err, response) {
          process.stdout.write('done'.blue);
          console.log('\n\nApplication deployed to '.blue + environment.white.bold + '.'.blue);
          
          callback();
        });
      }
    }); // end build.finalize
  };
};

internals.initiateDeploy = function (app, environment, cwd, callback) {
  return function (err, buildData) {
    var build = app.builds.id(buildData.id);
    
    process.stdout.write('done'.blue);
    process.stdout.write('\nDeploying build ... ');
    
    streamDir(cwd)
      .on('data', function (filePath) {
        internals.files.push(filePath);
      })
      .on('end', function () {
        async.each(
          internals.files,
          internals.uploadFile(buildData, cwd),
          internals.finalizeRelease(environment, build, callback)
        );
      });
  };
};

var release = function (environment, callback) {
  var cwd = process.cwd();
  var config = require(path.join(cwd, 'divshot.json'));
  var app = cli.api.apps.id(config.name);
  
  process.stdout.write('\nCreating build ... ');
  
  app.builds.create({ message: config.name }, internals.initiateDeploy(app, environment, cwd, callback));
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