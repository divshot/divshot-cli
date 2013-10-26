var path = require('path');
var file = require('file');
var _ = require('lodash');

module.exports = function (app) {
  file.walkSync(__dirname, function (dirPath, dirs, files) {
    files = removeIndexFile(files);
    _.each(files, function (file) {
      require(path.join(__dirname, file))(app);
    });
  });
};

function removeIndexFile (arr) {
  var indexIdx = arr.indexOf('index.js')
  arr.splice(indexIdx, 1);
  return arr;
}