var format = require('chalk');
var regular = require('regular');
var _ = require('lodash');

exports.require = ['authenticate', 'config'];

exports.register = function () {
  var command = this;
  
  command.api.apps.id(command.config.name).get()
    .then(function (app) {
      
      if (!app.custom_domains || !app.custom_domains.length) {
        command.update('You don\'t have any custom domains for ' + format.bold(config.name) + '.\nUse ' + format.bold('divshot domains:add [www.domain.com]') + ' to add a domain.');
        return command.done(null, []);
      }
      
      command.update('Custom domains for ' + format.bold(command.config.name) + ':\n');
      
      _.each(app.custom_domains, function (domain) {
        command.update('  ' + format.bold(domain));
      });
      
      command.done(null, app.custom_domains);
    }, function (err) {
      command.error(err);
    });
};

exports.tasks = {
  add: function (domain) {
    var command = this;
    
    if (!isValidDomain(domain)) return command.error(command.errors.INVALID_DOMAIN);
    
    command.api.apps.id(command.config.name).domains.add(domain, function (err, response) {
      if (err) return command.error(err);
      if (+response.statusCode === 304) return command.error(command.errors.DOMAIN_IN_USE);
      if (+response.statusCode >= 400) return command.error(JSON.parse(response.body).error);
      
      command.update(format.bold(domain) + ' has been added to ' + format.bold(commaind.config.name));
      command.done();
    });
  },
  
  remove: function (domain) {
    var command = this;
    
    if (!isValidDomain(domain)) return command.error(command.errors.INVALID_DOMAIN);
    
    command.api.apps.id(command.config.name).domains.remove(domain, function (err, response) {
      if (err || +response.statusCode !== 200) return command.error(command.errors.DEFAULT);
      
      command.update(format.bold(domain) + ' has been removed from ' + format.bold(command.config.name));
      command.done(); 
    });
  }
};

function isValidDomain(domain) {
  return (domain && regular.domain.test(domain) && domain.split('.').length > 2);
}

exports.description = 'list the apps custom domains';
exports.tasks.add.description = 'add a custom domain to the app';
exports.tasks.remove.description = 'remove a custom domain from the app';