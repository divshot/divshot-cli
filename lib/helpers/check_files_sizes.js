var sizer = require('sizer');
var TEN_MB = 10000000;
var logger = require('feedback');
var format = require('chalk');
var ignoreGlobs = [
  '.**/**',
  '.**'
];

module.exports = function (directory, done) {
  sizer.bigger(TEN_MB, directory, ignoreGlobs, function (err, files) {
    if (files.length) {
      logger.error(format.red('Files MUST NOT be greater than 10MB.'));
      
      files.forEach(function (file) {
        logger.error(format.yellow(file) + ' is too big.');
      });
    }
    
    done(files.length);
  });
};