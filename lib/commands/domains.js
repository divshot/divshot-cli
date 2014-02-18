var format = require('chalk');
var regular = require('regular');
var _ = require('lodash');

module.exports = function (cli) {
  var command = cli.command('domains');
  
  command.before('authenticate');
  command.description('list the apps custom domains');
  command.handler(function (done) {
    cli.api.apps.id(cli.config.name).get()
      .then(function (app) {
        if (!app.custom_domains || !app.custom_domains.length) {
          cli.log('You don\'t have any custom domains for ' + format.bold(cli.config.name) + '.\nUse ' + format.bold('divshot domains:add [www.domain.com]') + ' to add a domain.');
          return done(null, []);
        }
        
        cli.log('Custom domains for ' + format.bold(cli.config.name) + ':\n');
        
        _.each(app.custom_domains, function (domain) {
          cli.log('  ' + format.bold(domain));
        });
        
        done(null, app.custom_domains);
      }, function (err) {
        done(cli.errors.DEFAULT);
      });
  });
  
  var add = command.task('add');
  var remove = command.task('remove');
  
  add.description('add a custom domain to the app');
  remove.description('remove a custom domain from the app');
  
  add.handler(function (domain, done) {
    if (!isValidDomain(domain)) return done(cli.errors.INVALID_DOMAIN);
    
    cli.api.apps.id(cli.config.name).domains.add(domain, function (err, response) {
      if (err) return done(cli.errors.DEFAULT);
      if (+response.statusCode === 304) return done(cli.errors.DOMAIN_IN_USE);
      if (+response.statusCode >= 400) return done(JSON.parse(response.body).error);
      
      cli.log(format.bold(domain) + ' has been added to ' + format.bold(cli.config.name), {success: true});
      done();
    });
  });
  
  remove.handler(function (domain, done) {
    if (!isValidDomain(domain)) return done(cli.errors.INVALID_DOMAIN);
    
    cli.api.apps.id(cli.config.name).domains.remove(domain, function (err, response) {
      if (err || +response.statusCode !== 200) return done(cli.errors.DEFAULT);
      
      cli.log(format.bold(domain) + ' has been removed from ' + format.bold(cli.config.name), {success: true});
      done(); 
    });
  });
  
  function isValidDomain(domain) {
    return (domain && regular.domain.test(domain) && domain.split('.').length > 2);
  }
};