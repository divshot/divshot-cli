var format = require('chalk');

module.exports = function (cli) {
  var command = cli.command('rollback <environment>');
  
  command.before('authenticate', 'isApp');
  command.description('rollback an environment to a previous release');
  command.handler(function (environment, done) {
    if (!environment) return done(cli.errors.MISSING_ENVIRONMENT);
    
    var config = cli.cwd.getConfig();
    
    cli.log('Rolling back ' + format.bold(environment) + ' to previous release ...');
    cli.api.apps.id(config.name).releases.env(environment).rollback(function (err, response) {
      if (err) return done(cli.errors.DEFAULT);
      
      cli.log(format.bold(environment) + ' has been rolled back for ' + format.bold(config.name) + '.', {success: true});
      done();
    });
  });
};