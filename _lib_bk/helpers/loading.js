var feedback = require('feedback');

module.exports = function (timing) {
  var interval;
  var callback = function () {
    clearInterval(interval);
  };
  
  timing = timing || 500;
  
  interval = setInterval(function () {
    feedback.write('.');
  }, timing);
  
  return callback;
};