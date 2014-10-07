var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var feedback = require('feedback');
var jsonlint = require('jsonlint');

var Cwd = function () {
  this.configFilename = 'divshot.json';
  this.cwd = process.cwd();
  this.filePath = path.join(process.cwd(), this.configFilename);
  this._overrideAppName = null;
};

Cwd.prototype.getConfig = function () {
  var config = {};
  
  if (this.hasConfig()) {
    var fileContents = fs.readFileSync(this.filePath).toString();
    validateConfigFile(fileContents);
    config = JSON.parse(fileContents);
  }
  
  if (this._overrideAppName) {
    config.name = this._overrideAppName;
  }
  
  return config;
};

Cwd.prototype.setConfig = function (data, overwrite) {
  if (!this.hasConfig()) fs.writeFileSync(this.filePath, stringify({}));
  
  var originalConfigFile = JSON.parse(fs.readFileSync(this.filePath));
  var config = (overwrite) ? data : _.extend(originalConfigFile, data);
  
  fs.writeFileSync(this.filePath, stringify(config));
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

Cwd.prototype.overrideAppName = function (appName) {
  this._overrideAppName = appName;
};

// Setters
Cwd.prototype.setCwd = function (dir) {
  this.cwd = path.resolve(process.cwd(), dir);
  this.setConfigFilename(this.configFilename);
};

Cwd.prototype.setConfigFilename = function (filename) {
  this.configFilename = filename;
  this.filePath = path.join(this.cwd, this.configFilename);
};

module.exports = Cwd;

function validateConfigFile (fileContents) {
  try {
    jsonlint.parse(fileContents);
  }
  catch (e) {
    var msgArr = e.message.split('\n');
    var msg = msgArr[1] + '\n' + msgArr[2];
    
    feedback.info();
    feedback.error('Invalid Divshot configuration file. ' + msgArr[0] + '\n');
    feedback.info(msg);
    
    process.exit(1);
  }
}

function stringify (data) {
  return JSON.stringify(data, null, 2);
};