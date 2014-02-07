var promptly = require('promptly');
var format = require('chalk');
var regular = require('regular');

exports.require = ['authenticate', 'config'];

exports.register = function (name) {
  var command = this;
  
  command.update('Creating app ...');
  
  parseAppname(command, name, command.config.name, function (name) {
    command.api.apps.create(name, function (err, response, body) {
      if (err) return command.error(err);
      if (response.error === 'invalid_token') return command.error(command.errors.INVALID_TOKEN);
      if (response.error && response.error.name) return command.error('The app name ' + response.error.name[0]);
      if (response.status >= 400) return command.error(response.error);
      if (body.error && body.error.name) return command.error('That app name ' + body.error.name[0]);
      
      command.update(format.bold(name) + ' has been created', {success: true});
      command.done(null, body);
    });
  });
};

function parseAppname (command, name, configName, callback) {
  if (name) return callback(name);
  if (configName) return callback(configName);
  
  promptly.prompt('App name: ', {
    trim: true,
    validator: function (name) {
      return (regular.slug.test(name)) ? name : false;
    }
  }, function (err, appName) {
    if (!appName) return command.error('Invalid app name');
    callback(appName);
  });
}