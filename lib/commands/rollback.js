var format = require('chalk');

module.exports = function (cli) {
  var command = cli.command('rollback');
  
  command.before('authenticate');
  command.description('rollback an environment to a previous release');
  command.handler(function (environment, done) {
    if (!environment) return done(cli.errors.MISSING_ENVIRONMENT);
    
    cli.log('Rolling back ' + format.bold(environment) + ' to previous release ...');
    cli.api.apps.id(cli.config.name).releases.env(environment).rollback(function (err, response) {
      if (err) return done(cli.errors.DEFAULT);
      
      cli.log(format.bold(environment) + ' has been rolled back.', {success: true});
      done();
    });
  });
};