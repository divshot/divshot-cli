var JSUN = require('JSUN');
var request = require('request');
var split = require('split');
var shrub = require('shrub');
var Deployment = require('./deployment');
var Emitter = require('tiny-emitter');

var Build = function (options) {
  this._appRootDir = options.appRootDir;
  this._appConfig = options.appConfig;
  this._types = options.types;
  
  this.app = options.app;
  this.environment = options.environment;
  this.emitter = new Emitter();
  
  this._files = {};
  
};

Build.prototype.create = function (payload, done) {
  var self = this;
  
  this.app.builds.create(payload, function (err, buildData) {
    if (err) return done('Failed to initiate deploy: ' + err);
    if (buildData.error === 'invalid_token') return next('You need to log in before you can do this');
    if (!buildData.id) return next('You can\'t release an app that doesn\'t exist!');
    
    self._buildData = buildData;
    self.build = self.app.builds.id(self._buildData.id);
    done(null, buildData);
  });
};

Build.prototype.package = function (done) {
  var deployment = new Deployment(this._types, this._buildData.loadpoint, this.exclude());
  
  return deployment.push(this._appRootDir)
    .pipe(request(deployment._requestOptions))
    .pipe(split(this._parseServerStream))
    .on('error', done)
    .on('data', this._deploymentData(this._files))
    .on('end', this._deploymentEnd(this._files, done));
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
  var self = this;
  
  return function (data) {
    switch (data.event) {
      case 'unpack':
        self.emit('unpack', data.data.path);
        files[data.data.path] || (files[data.data.path] = {}); // for zip uploads
        files[data.data.path].unpacked = true;
        break;
      case 'released':
        self.emit('released', data.data.path);
        files[data.data.path].released = true;
        break;
      case 'message':
        self.emit('message', data.data);
        break;
      case '_error':
        files[data.data.path].error = data.data;
        self.emit('error', data.data);
        break;
      case 'done':
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

Build.prototype.on = function (evt, callback, context) {
  return this.emitter.on(evt, callback, context);
};

Build.prototype.emit = function (evt) {
  return this.emitter.emit.apply(this.emitter, [].slice.call(arguments, 0));
};

Build.prototype.off = function (evt, callback) {
  return this.emitter.off(evt, callback);
};

module.exports = Build;