var fs = require('fs');
var request = require('request');
var semver = require('semver');

var VERSION_EXPIRES = 12 * 60 * 60 * 1000 // 12 hours

var Package = function (user) {
  this._latestPackageUrl = 'http://registry.npmjs.org/divshot-cli/latest';
  this._user = user;
  this.version = require('../package.json').version;
};

Package.prototype.hasLatestVersion = function (callback) {
  var self = this;
  var isLatest = true;
  
  this.latestVersion(function (err, latestPackageVersion) {
    if (err) return callback(err);
    if (semver.gt(latestPackageVersion, self.version)) isLatest = false;
    
    callback(err, isLatest);
  });
};

Package.prototype.latestVersion = function (callback) {
  var self = this;
  var lastVersionCheck = this._user.attributes.lastVersionCheck;
  var lastVersionCheckDate;
  var currentDate = new Date();
  
  if (lastVersionCheck) lastVersionCheckDate = new Date(lastVersionCheck);
  
  if (!lastVersionCheckDate || currentDate - lastVersionCheckDate >= VERSION_EXPIRES) {
    request(this._latestPackageUrl, function (err, response, body) {
      try {
        var remotePackage = JSON.parse(body);
      }
      catch (e) {}
      finally {
        self._user.set('lastVersionCheck', new Date());
        callback(err, remotePackage.version);
      }
    });
  }
  else {
    callback(null, this.version);
  }
};

module.exports = Package;