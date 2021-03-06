var format = require('chalk');
var environments = require('../environments');

module.exports = function (cli) {
  
  var command = cli.command('promote <from> <to>');
  
  command.before('authenticate', 'isApp');
  command.description('promote one environment to another');
  
  command.handler(function (from, to, done) {
    
    var bold = format.bold;
    
    if (!from || !to) {
      return done(cli.errors.MISSING_PROMOTE_ENVIRONMENTS);
    }
    
    var name = cli.cwd.getConfig().name;
    
    cli.log();
    cli.log('Promoting ' + bold(from) + ' to ' + bold(to) + ' ...');
    cli.api.apps.id(name).releases.env(to).promote(from, function (err, release) {
      
      if (release.status == 404) {
        return done(cli.errors.INVALID_ENVIRONMENT);
      }
      
      if (err) {
        return done(cli.errors.DEFAULT);
      }
      
      cli.log(name + ' ' + bold(from) + ' promoted to ' + bold(to) , {success: true});
      done(null, release);
    });
  });
};