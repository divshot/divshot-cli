var regular = require('regular');

module.exports = function (app) {
  app.program
    .command('domains')
    .description('list your domains')
    .example('domains')
    .withConfig()
    .withAuth()
    .handler(function (config) {
      config = this.config;
      
      app.api.apps.id(config.name).get(function (err, dioApp) {
        app.logger.writeln();
        
        if (!dioApp.custom_domains || !dioApp.custom_domains.length) {
          app.logger.info('You don\'t have any custom domains for ' + app.format.bold(config.name) + '.\nUse ' + app.format.bold('divshot domains:add [www.domain.com]') + ' to add a domain.');
          return;
        }
        
        app.logger.info('Custom domains for ' + app.format.bold(config.name));
        app.logger.writeln();
        
        app._.each(dioApp.custom_domains, function (domain) {
          app.logger.info('  ' + app.format.bold(domain));
        });
      });
    });
  
  app.program
    .command('domains:add [domain]')
    .description('add a custom domain to your app')
    .example('domains:add [domain]')
    .withConfig()
    .handler(validateDomain(function (domain) {
      var config = this.config;
      
      app.api.apps.id(config.name).domains.add(domain, function (err, response) {
        if (+response.statusCode === 304) return app.logger.error('That domain is already in use');
        if (+response.statusCode >= 400) return app.logger.error(JSON.parse(response.body).error);
        
        app.logger.writeln();
        app.logger.info(app.format.bold(domain) + ' has been added to ' + app.format.bold(config.name));
      });
    }));
  
  app.program
    .command('domains:remove [domain]')
    .description('remove a custom domain from your app')
    .example('domains:remove [domain]')
    .withConfig()
    .handler(validateDomain(function (domain) {
      var config = this.config;
      
      app.api.apps.id(config.name).domains.remove(domain, function (err, response) {
        if (err || +response.statusCode !== 200) return app.logger.error('There was an error removing the domain. Please try again.');
        
        app.logger.writeln();
        app.logger.info(app.format.bold(domain) + ' has been removed from ' + app.format.bold(config.name));
      });
    }));
  
  function validateDomain (callback) {
    return function (domain) {
      if (!isValidDomain(domain)) return app.logger.error('Please provide a valid domain (www.example.com)');
        
      callback.call(this, domain);
    };
  }
  
  function isValidDomain(domain) {
    return (domain && regular.domain.test(domain) && domain.split('.').length > 2);
  }
};