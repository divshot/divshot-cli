var regular = require('regular');
var format = require('chalk');
var _ = require('lodash');

exports.require = ['authenticate', 'config'];

exports.register = function (env, credentials) {
  var command = this;
  
  if (!env) return command.error(command.errors.MISSING_ENVIRONMENT);
  if (!credentials) return command.error(command.errors.MISSING_CREDENTIALS);
  
  var username = credentials.split(':')[0];
  var password = credentials.split(':')[1];
  
  if (!regular.basicAuth.test(credentials) || !username || !password) return command.error(command.errors.INVALID_CREDENTIALS);
  
  command.execute.apps(function (err, apps) {
    var appObj = _.find(apps.self, function (app) {
      return app.name === command.config.name;
    });
    
    if (!appObj) return command.error(format.bold(command.config.name) + ' app does not exist');
    
    command.api.apps.id(appObj.id).env(env).config({
      auth: credentials
    }, function (err, response) {
      if (err || response.statusCode !== +200) return command.error(command.errors.DEFAULT);
      
      command.update(format.bold(env) + ' has been protected.', {success: true});
      command.done();
    });
  });
};