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

Cwd.prototype.setConfig = function (data) {
  if (!fs.existsSync(this.filePath)) fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
  
  var config = JSON.parse(fs.readFileSync(this.filePath));
  
  fs.writeFileSync(this.filePath, this.stringify(_.extend(config, data)));
};

Cwd.prototype.hasConfig = function () {
  return fs.existsSync(this.filePath);
};

Cwd.prototype.stringify = function (data) {
  return JSON.stringify(data, null, 2);
};


module.exports = Cwd;