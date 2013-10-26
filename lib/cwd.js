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
  
  _.assign(config, data);
  fs.writeFileSync(this.filePath, JSON.stringify(config, null, 2));
};

module.exports = Cwd;