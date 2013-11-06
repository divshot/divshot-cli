var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var Cwd = function () {
  this.configFileName = 'divshot.json';
  this.cwd = process.cwd();
  this.filePath = path.join(process.cwd(), this.configFileName);
};

Cwd.prototype.getConfig = function () {
  return this.hasConfig() ? require(this.filePath) : {};
};

Cwd.prototype.setConfig = function (data, overwrite) {
  if (!this.hasConfig()) fs.writeFileSync(this.filePath, this.stringify({}));
  
  var originalConfigFile = JSON.parse(fs.readFileSync(this.filePath));
  var config = (overwrite) ? data : _.extend(originalConfigFile, data);
  
  fs.writeFileSync(this.filePath, this.stringify(config));
};

Cwd.prototype.setConfigValue = function (key, value) {
  var config = this.getConfig();
  config[key] = value;
  this.setConfig(config, true);
};

Cwd.prototype.removeConfigValue = function (key) {
  var config = this.getConfig();
  delete config[key];
  this.setConfig(config, true);
};

Cwd.prototype.hasConfig = function () {
  return fs.existsSync(this.filePath);
};

Cwd.prototype.stringify = function (data) {
  return JSON.stringify(data, null, 2);
};

module.exports = Cwd;