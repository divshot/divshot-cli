var format = require('chalk');
var regular = require('regular');
var _ = require('lodash');

module.exports = function (cli) {
  var command = cli.command('domains', 'dom');
  
  command.before('authenticate');
  command.description('list, add, and remove custom domains for your apps');
  command.handler(function (done) {
    var appName = cli.cwd.getConfig().name;
    
    cli.api.apps.id(appName).get()
      .then(function (app) {
        if (!app.custom_domains || !app.custom_domains.length) {
          cli.log('You don\'t have any custom domains for ' + format.bold(appName) + '.\nUse ' + format.bold('divshot domains:add [www.domain.com]') + ' to add a domain.');
          return done(null, []);
        }
        
        cli.log('Custom domains for ' + format.bold(appName) + ':\n');
        
        _.each(app.custom_domains, function (domain) {
          cli.log('  ' + format.bold(domain));
        });
        
        done(null, app.custom_domains);
      }, function (err) {
        done(cli.errors.DEFAULT);
      });
  });
  
  var add = command.task('add <domain>');
  var remove = command.task('remove <domain>');
  
  add.description('add a custom domain to the app');
  remove.description('remove a custom domain from the app');
  
  add.handler(function (domain, done) {
    if (!isValidDomain(domain)) return done(cli.errors.INVALID_DOMAIN);
    
    var appName = cli.cwd.getConfig().name;
    
    cli.api.apps.id(appName).domains.add(domain, function (err, response) {
      if (err) return done(cli.errors.DEFAULT);
      if (+response.statusCode === 304) return done(cli.errors.DOMAIN_IN_USE);
      if (response.statusCode == 402) {
        var upgradeMessage = cli.errors.UPGRADE_TO_USE_FEATURE + '\n\nVisit ' + format.bold('https://dashboard.divshot.com/apps/' + appName  + '/settings') + ' to upgrade your app.';
        return done(upgradeMessage);
      }
      if (+response.statusCode >= 400) return done(JSON.parse(response.body).error);
      
      cli.log(format.bold(domain) + ' has been added to ' + format.bold(appName), {success: true});
      done();
    });
  });
  
  remove.handler(function (domain, done) {
    if (!isValidDomain(domain)) return done(cli.errors.INVALID_DOMAIN);
    
    var appName = cli.cwd.getConfig().name;
    
    cli.api.apps.id(appName).domains.remove(domain, function (err, response) {
      if (err || +response.statusCode !== 200) return done(cli.errors.DEFAULT);
      
      cli.log(format.bold(domain) + ' has been removed from ' + format.bold(appName), {success: true});
      done(); 
    });
  });
  
  function isValidDomain(domain) {
    return (domain && regular.domain.test(domain) && domain.split('.').length > 2);
  }
};