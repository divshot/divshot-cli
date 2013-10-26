var fs = require('fs');
var path = require('path');

var User = function (baseDir) {
  this.baseDir = baseDir
  this.attributes = {};
  this.filePath = path.join(this.baseDir, 'config', 'user.json');
  
  this.load();
};

User.prototype.load = function () {
  if (!fs.existsSync(this.filePath)) {
    fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
  }
  
  return require(this.filePath);
};

User.prototype.save = function () {
  fs.writeFileSync(this.filePath, JSON.stringify(this.attributes, null, 2));
};

User.prototype.get = function (key) {
  return this.attributes[key];
};

User.prototype.set = function (key, value) {
  this.attributes[key] = value;
  this.save();
};

User.prototype.logout = function () {
  delete this.attributes.token;
  this.save();
};

module.exports = User;