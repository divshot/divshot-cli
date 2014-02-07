var promptly = require('promptly');
var format = require('chalk');

exports.require = ['authenticate', 'config', 'cwd'];

exports.description = 'change the name of the app';

exports.register = function (name) {
  var command = this;
  var originalName = command.config.name;
  
  if (!name) return command.error(command.errors.MISSING_APP_NAME);
  
  promptly.confirm('Are you sure you want to rename this app? It will be permanant and change the app\'s url. (y/n)', function (err, rename) {
    if (!rename) return command.done();
    
    command.update('Renaming app to ' + format.bold(name) + ' ...');
    
    command.api.apps.id(command.config.name).update({name: name}, function (err, response) {
      if (response.error) return command.error(response.error);
      if (response.statusCode && response.statusCode >= 400) return command.error(command.errors.DEFAULT);
      
      command.cwd.setConfigValue('name', name);
      command.update(format.bold(originalName) + ' has been renamed to ' + format.bold(name), {success: true});
      command.done(null, command.cwd.getConfig());
    });
  });
};