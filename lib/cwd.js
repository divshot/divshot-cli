var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var Cwd = function () {
  this.configFileName = 'divshot.json';
  this.cwd = process.cwd();
  this.filePath = path.join(process.cwd(), this.configFileName);
};

Cwd.prototype.getConfig = function () {
  if (fs.existsSync(this.filePath)) {
    return require(this.filePath);
  }
};

Cwd.prototype.setConfig = function (data, overwrite) {
  if (!fs.existsSync(this.filePath)) fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
  
  var originalConfigFile = JSON.parse(fs.readFileSync(this.filePath));
  var config = (overwrite)
    ? data
    : _.extend(originalConfigFile, data);
  
  fs.writeFileSync(this.filePath, this.stringify(config));
};

Cwd.prototype.hasConfig = function () {
  return fs.existsSync(this.filePath);
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

Cwd.prototype.stringify = function (data) {
  return JSON.stringify(data, null, 2);
};


module.exports = Cwd;