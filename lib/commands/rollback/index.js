var format = require('chalk');

exports.require = ['authenticate', 'config'];

exports.register = function (environment) {
  var command = this;
  
  if (!environment) return command.error(command.errors.MISSING_ENVIRONMENT);
  
  command.update('Rolling back ' + format.bold(environment) + ' to previous release ...');
  command.api.apps.id(command.config.name).releases.env(environment).rollback(function (err, response) {
    if (err) return command.error(command.errors.DEFAULT);
    
    command.update(format.bold(environment) + ' has been rolled back.', {success: true});
    command.done();
  });
};