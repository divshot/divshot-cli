var path = require('path');
var file = require('file');
var _ = require('lodash');

var requireCommands = function (app) {
  file.walkSync(__dirname, function (dirPath, dirs, files) {
    files = removeIndexFile(files);
    _.each(files, requireCommand(app));
    _.each(dirs, requireCommand(app));
  });
};

var requireCommand = function (app) {
  return function (file) {
    var command = require(path.join(__dirname, file));
    if (typeof command === 'function') command(app);
  };
};

var removeIndexFile = function (arr) {
  var idx = arr.indexOf('index.js');
  arr.splice(idx, 1);
  return arr;
};

module.exports = requireCommands;