var _ = require('lodash');
var format = require('chalk');

module.exports = function (cli) {
  
  var command = cli.command('rollback <environment> <version>');
  
  command.before('authenticate', 'isApp');
  command.description('rollback an environment to a previous release');
  command.handler(function (environment, done) {
    
    if (!environment) {
      return done(cli.errors.MISSING_ENVIRONMENT);
    }
    
    var config = cli.cwd.getConfig();
    var releaseVersion = _.last(cli.args.args);
    var app = cli.api.apps.id(config.name).releases.env(environment);
    
    cli.log();
    
    // Rollback to specific version
    if (cli.args.args.length > 1 && _.isNumber(releaseVersion)) {
      cli.log('Rolling back ' + format.bold(environment) + ' to version ' + releaseVersion + ' ...');
      app.rollbackTo(releaseVersion, responseHandler);
    }
    
    // Rollback to previous version
    else {
      cli.log('Rolling back ' + format.bold(environment) + ' to previous release ...');
      app.rollback(responseHandler);
    }
    
    function responseHandler (err, response) {
        
      if (err) {
        return done(cli.errors.DEFAULT);
      }
      
      if (response.statusCode == 403) {
        return done(cli.errors.INVALID_RELEASE_VERSION);
      }
      
      cli.log(format.bold(environment) + ' has been rolled back for ' + format.bold(config.name) + '.', {success: true});
      done();
    }
  });
};