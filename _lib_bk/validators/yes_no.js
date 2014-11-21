var feedback = require('feedback');

module.exports = function (value) {
  if (value === false || value === true) return value;
  
  var validValue = false;
  value = value.toLowerCase();
  
  if (value === 'y' || value === 'yes') value = true; validValue = true;
  if (value === 'n' || value === 'no') value = false; validValue = true;
  
  if (!validValue) {
    feedback.error('You must answer either "y" or "n"');
    throw '';
  }
  
  return value;
};