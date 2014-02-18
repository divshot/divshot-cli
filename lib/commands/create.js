var promptly = require('promptly');
var format = require('chalk');
var regular = require('regular');

module.exports = function (cli) {
  var command = cli.command('create');
  
  command.before('authenticate');
  command.description('create a new app');
  
  command.handler(function (name, done) {
    cli.log('Create app ...');
    
    parseAppname(name, cli.config.name, function (err, name) {
      if (err) return done(err);
      
      cli.api.apps.create(name, function (err, response, body) {
        if (err) return done(err);
        if (response.error === 'invalid_token') return done(cli.errors.INVALID_TOKEN);
        if (response.error && response.error.name) return done('The app name ' + response.error.name[0]);
        if (response.status >= 400) return done(response.error);
        if (body.error && body.error.name) return done('That app name ' + body.error.name[0]);
        
        cli.log(format.bold(name) + ' has been created', {success: true});
        done(null, body);
      });
    });
  });
  
  function parseAppname (name, configName, callback) {
    if (name) return callback(null, name);
    if (configName) return callback(null, configName);
    
    promptly.prompt('App name: ', {
      trim: true,
      validator: function (name) {
        return (regular.slug.test(name)) ? name : false;
      }
    }, function (err, appName) {
      if (!appName) return callback(cli.errors.INVALID_APP_NAME);
      callback(null, appName);
    });
  }
};