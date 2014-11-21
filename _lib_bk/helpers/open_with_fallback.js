var open = require('open');
var format = require('chalk');

module.exports = function (url, fallbackMessage, callback, log) {
  log = log || console.log.bind(console);
  var p = open(url);
  
  p.on('exit', function(code) {
    if (parseInt(code) > 0) {
      log();
      log(fallbackMessage)
    }
    else {
      log();
      log('Opening ' + format.bold(url));
    }
    
    callback(code);
  });
};