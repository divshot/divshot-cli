var open = require('open');
var format = require('chalk');

module.exports = function (cli) {
  cli.command('open <optional environment>')
    .before('isApp')
    .description('open the current app in a browser')
    .handler(function (environment, done) {
      var config = cli.cwd.getConfig();
      
      if (!cli.environments.isEnvironment(environment || cli.environments.default())) return done(cli.errors.INVALID_ENVIRONMENT);
      if (!config.name) return done(cli.errors.DIRECTORY_NOT_APP);
      
      var uri = config.name + '.divshot.io';
      var fullUrl = (environment)
        ? 'http://' + environment + '.' + uri
        : 'http://' + uri; 
      
      cli.log('Opening ' + format.bold(fullUrl));
      
      open(fullUrl);
    });
};