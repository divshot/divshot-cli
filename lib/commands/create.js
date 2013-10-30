var fs = require('fs');
var path = require('path');
var promptly = require('promptly');
var regular = require('regular');
var _ = require('lodash');

module.exports = function (app) {
  app.program
    .command('create')
    .description('create a new app')
    .example('create [app name (optional)]')
    .withAuth()
    .handler(function () {
      var name = (arguments.length > 1) ? arguments[0] : null;
      var internal;
      
      app.logger.writeln()
      app.logger.write('Creating app ...')
      
      interval = setInterval(function () {
        app.logger.write('.');
      }, 1000);
      
      getName(app, name, function (err, appName) {
        app.api.apps.create({
          name: appName
        }, function (err, response) {
          app.logger.write(' done'.blue);
          clearInterval(interval);
          
          if (err) return app.logger.error(err);
          if (response.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');
          if (response.error && response.error.name) return app.logger.error('The app name ' +response.error.name[0]);
          if (response.status >= 400) return app.logger.error(response.error);
          
          app.logger.writeln();
          app.logger.success(appName.bold + ' was successfully created');
        });
      });
    });
};

function getName (app, name, callback) {
  if (name) return callback(null, name);
  
  // Check config file
  var config = app.cwd.getConfig();
  if (config && config.name) {
    return callback(null, config.name);
  }
  
  promptly.prompt('App name: ', {
    trim: true,
    validator: function (name) {
      return (regular.slug.test(name)) ? name : false;
    }
  }, function (err, appName) {
    if (!appName) return app.logger.error('Invalid app name');
    
    callback(null, appName);
  });
}