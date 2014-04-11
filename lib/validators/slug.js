var regular = require('regular');
var feedback = require('feedback');

module.exports = function (value) {
  if (!regular.slug.test(value.toLowerCase())) {
    feedback.error('Name must be a valid subdomain value.');
    throw '';
  }
  
  return value;
};