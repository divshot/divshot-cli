var format = require('chalk');
var _ = require('lodash');

module.exports = function (cli) {
  
  var command = cli.command('domains', 'dom');
  
  command.before('authenticate');
  command.description('list, add, and remove custom domains for your apps');
  command.handler(function (done) {
    
    var appName = cli.cwd.getConfig().name;
    
    cli.api.apps.id(appName).domains.list(function (err, response) {
      
      cli.log();
      
      // Error in request
      if (response.error && response.status >= 400) {
        
        // Not allowed to change domain settings
        // on this app
        if (response.status == 401) {
          return done(response.error);
        }
        
        // Need to upgrade
        if (response.status == 402) {
          return done(cli.errors.UPGRADE_FOR_NON_PROD_DOMAINS);
        }
        
        return done(response.error);
      }
      
      if (response.error) {
        return done(cli.errors.NOT_ADMIN);
      }
      
      // No custom domains
      if (response.length < 1) {
        cli.log('You don\'t have any custom domains for ' + format.bold(appName) + '.\nUse ' + format.bold('divshot domains:add [www.domain.com]') + ' to add a domain.');
        return done(null, []);
      }
      
      var domains = response;
      
      cli.log('Custom domains for ' + format.bold(appName) + ':\n');
      
      domains.forEach(function (domain) {
        
        cli.log('  ' + format.bold(domain.name) + ' (' + domain.env + ')');
      });
      
      done(null, domains);
    });
  });
  
  var add = command.task('add <domain>');
  var remove = command.task('remove <domain>');
  
  add.description('add a custom domain to the app');
  remove.description('remove a custom domain from the app');
  
  add.handler(function (domain, done) {
    
    // Ensure domain is added to correct environment
    var args = cli.args.args;
    var environment = 'production';
    if (args.length > 1) {
      environment = args[0];
      domain = args[1];
    }
    
    var appName = cli.cwd.getConfig().name;
    
     cli.api.apps.id(appName).domains.add(domain, {env: environment}, function (err, response, body) {
      
      if (err) {
        return done(cli.errors.DEFAULT);
      }
      if (response.statusCode == 402) {
        var upgradeMessage = cli.errors.UPGRADE_TO_USE_FEATURE + '\n\nVisit ' + format.bold('https://dashboard.divshot.com/apps/' + appName  + '/settings') + ' to upgrade your app.';
        return done(upgradeMessage);
      }
      if (+response.statusCode >= 400) {
        return done(JSON.parse(response.body).error);
      }
      
      cli.log();
      cli.log(format.bold(domain) + ' has been added to ' + format.bold(appName) + ' on the ' + format.bold(environment) + ' environment.', {success: true});
      cli.log('See ' + format.bold('http://docs.divshot.io/guides/domains') + ' for details on how to configure DNS for your domain.');

      var data = JSON.parse(response.body);

      if (data.apex) {
        cli.log('');
        cli.log('You have added an Apex domain to your application.');
        cli.log('Be sure to check the documentation for extra details about Apex domain configuration.');
      }

      done();
    });
  });
  
  remove.handler(function (domain, done) {
    
    var appName = cli.cwd.getConfig().name;
    
    cli.api.apps.id(appName).domains.remove(domain, function (err, response) {
      
      cli.log();
      
      if (err || +response.statusCode !== 200) {
        return done(cli.errors.DEFAULT);
      }
      
      cli.log(format.bold(domain) + ' has been removed from ' + format.bold(appName), {success: true});
      done(); 
    });
  });
};