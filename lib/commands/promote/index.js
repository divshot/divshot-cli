var format = require('chalk');

module.exports = function (cli) {
  var command = cli.command('promote');
  
  command.before('authenticate');
  command.description('promote one environment to another');
  
  command.action(function (from, to, done) {
    var bold = format.bold;
    
    if (!from || !to) return done(cli.errors.MISSING_PROMOTE_ENVIRONMENTS);
    
    cli.log('Promoting ' + bold(from) + ' to ' + bold(to) + ' ...');
    cli.api.apps.id(cli.config.name).releases.env(to).promote(from, function (err, release) {
      if (err) return done(cli.errors.DEFAULT);
      
      cli.log(cli.config.name + ' ' + bold(from) + ' promoted to ' + bold(to) , {success: true});
      done(null, release);
    });
  });
};