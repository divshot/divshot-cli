var regular = require('regular');

module.exports = function (value) {
  if (!regular.slug.test(value)) {
    app.logger.error('Name must be a valid subdomain value.');
    throw '';
  }
  
  return value;
};