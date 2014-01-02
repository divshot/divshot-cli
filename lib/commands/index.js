var path = require('path');
var fs = require('fs');

var requireCommands = function (app) {
  fs.readdirSync(__dirname)
    .filter(function (file) {
      if (file !== 'index.js') return file;
    })
    .map(function (filePath) {
      return path.join(__dirname, filePath);
    })
    .forEach(function (filePath) {
      if (fs.lstatSync(filePath).isDirectory()) filePath = filePath + '/index.js';
      var command = require(filePath);
      if (typeof command === 'function') command(app);
    });
};

module.exports = requireCommands;