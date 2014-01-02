var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var requireCommands = function (app) {
  fs.readdirSync(__dirname)
    .filter(function (file) {
      if (file !== 'index.js') return file;
    })
    .map(function (filePath) {
      return path.join(__dirname, filePath);
    });
    .map(function (filePath) {
      requireCommand(file, app, fs.lstatSync(filePath).isDirectory())
    });
};

var requireCommand = function (file, app, isDir) {
  if (isDir) file = file + '/index.js';
  var command = require(path.join(__dirname, file));
  if (typeof command === 'function') command(app);
};

module.exports = requireCommands;