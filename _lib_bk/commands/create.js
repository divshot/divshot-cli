var promptly = require('promptly');
var format = require('chalk');
var regular = require('regular');

module.exports = function (cli) {
  var command = cli.command('create <app name>');
  
  command.before('authenticate');
  command.description('create a new app');
  
  command.handler(function (name, done) {
    cli.log('Creating app ...');
    
    parseAppname(name, cli.cwd.getConfig().name, function (err, name) {
      if (err) return done(err);
      
      cli.api.apps.create(name.toLowerCase(), function (err, response, body) {
        if (err) return done(err);
        if (response.error === 'invalid_token') return done(cli.errors.INVALID_TOKEN + ' ' + cli.errors.NOT_AUTHENTICATED);
        if (body.error) return done(body.error + ' ' + cli.errors.NOT_AUTHENTICATED);
        if (response.statusCode >= 400) return done(body.error + ' ' + cli.errors.NOT_AUTHENTICATED);
        
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