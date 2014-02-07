var format = require('chalk');
var promptly = require('promptly');
var _ = require('lodash');

exports.require = ['authenticate'];

exports.description = 'delete an app';

exports.register = function (appName) {
  var command = this;
  
  promptly.confirm('Are you sure you want to permanantly delete this app? (y/n)', function (err, confirmed) {
    if (!confirmed) return command.done();
    
    command.execute.apps(function (err, apps) {
      var appObj = _.find(apps.self, function (app) {
        return app.name === appName;
      });
      if (!appObj) return command.error(format.bold(appName) + ' app does not exist');
      
      command.api.apps.one(appObj.id).remove(function (err) {
        if (err) return command.error(command.errors.DEFAULT);
        
        command.update(format.bold(appName) + ' has been permanantly deleted.', {success: true});
        command.done();
      });
    });
  });
};