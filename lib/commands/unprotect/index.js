var format = require('chalk');
var _ = require('lodash');

exports.require = ['authenticate', 'config'];

exports.register = function (env) {
  var command = this;
  var appName = command.config.name;
  
  if (!env) return command.error(command.errors.MISSING_ENVIRONMENT);
  
  command.execute.apps(function (err, apps) {
    var appObj = _.find(apps.self, function (app) {
      return app.name === command.config.name;
    });
    
    if (!appObj) return command.error(format.bold(command.config.name) + ' app does not exist');
    
    command.api.apps.id(appObj.id).env(env).config({
      auth: ''
    }, function (err, response) {
      if (err || response.statusCode !== +200) return command.error(command.errors.DEFAULT);
      
      command.update(format.bold(env) + ' is now unprotected.', {success: true});
      command.done();
    });
  });
};