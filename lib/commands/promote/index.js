var format = require('chalk');

exports.require = ['authenticate', 'config'];

exports.description = 'promote one environment to another';

exports.register = function (from, to) {
  var command = this;
  var bold = format.bold;
  
  if (!from || !to) return command.error(command.errors.MISSING_PROMOTE_ENVIRONMENTS);
  
  command.update('Promoting ' + bold(from) + ' to ' + bold(to) + ' ...');
  command.api.apps.id(command.config.name).releases.env(to).promote(from, function (err, release) {
    if (err) return command.error(command.errors.DEFAULT);
    
    command.update(command.config.name + ' ' + bold(from) + ' promoted to ' + bold(to) , {success: true});
    command.done(null, release);
  });
};