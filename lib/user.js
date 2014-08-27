var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var User = function (baseDir) {
  this.baseDir = baseDir;
  this.attributes = {};
  
  // Create user and config directories
  var configDir = path.join(this.baseDir, 'config');
  mkdirp.sync(configDir);
  
  this.filePath = path.join(configDir, 'user.json');
  
  this.load();
};

User.prototype.load = function () {
  if (!fs.existsSync(this.filePath)) {
    fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
  }
  
  var config = require(this.filePath);
  this.attributes = config;
  return config;
};

User.prototype.save = function () {
  fs.writeFileSync(this.filePath, JSON.stringify(this.attributes, null, 2));
};

User.prototype.get = function (key) {
  return this.attributes[key];
};

User.prototype.set = function (key, value, save) {
  this.attributes[key] = value;
  if (save !== false) this.save();
};

User.prototype.logout = function () {
  delete this.attributes.token;
  this.save();
};

User.prototype.authenticated = function () {
  return this.attributes.token;
};

module.exports = User;