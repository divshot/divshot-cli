var format = require('chalk');

module.exports = function (cli) {
  var production = cli.command('performance', 'production')
    .description('ugrade the current app to performance status')
    .before('authenticate', 'isApp')
    .handler(function (done) {
      var config = cli.cwd.getConfig();
      
      cli.api.apps.id(config.name).get(function (err, app) {
        cli.log();
        
        if (app.production) cli.log(format.bold(config.name) + ' currently has performance status.');
        else cli.log('Application ' + format.bold(config.name) + ' is not currently have performance status.');
        
        done(null, app.production);
      });
    });
  
  production.task('on')
    .description('turn performance status on')
    .handler(function (done) {
      var config = cli.cwd.getConfig();
      
      cli.api.apps.id(config.name).update({
        production: true
      }, function (err, res) {
        cli.log();
        
        if (err) return done(err);
        if (res.status === 401) return done(cli.errors.NOT_ADMIN);
        if (res.status === 402) return done(cli.errors.NO_PRODUCTION_SLOTS);
        
        cli.log('Application ' + format.bold(config.name) + ' has been upgraded to performance status. CDN provisioning may take up to 10 minutes.', {success: true});
        done();
      });
    });
  
  production.task('off')
    .description('turn performance status off')
    .handler(function (done) {
      var config = cli.cwd.getConfig();
      
      cli.api.apps.id(config.name).update({
        production: false
      }, function (err, res) {
        cli.log();
        
        if (err) return done(err);
        if (res.status === 401) return done(cli.errors.NOT_ADMIN);
        if (res.status === 402) return done(cli.errors.NO_PRODUCTION_SLOTS);
        
        cli.log('Application ' + format.bold(config.name) + ' has been downgraded to non-performance status. CDN and custom domain SSL are now disabled for this app.', {success: true});
        done();
      });
    });
};