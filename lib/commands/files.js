var _ = require('lodash');
var format = require('chalk');

module.exports = function (cli) {
  cli.command('files <environment>')
    .description('show a list of the files for the given environment')
    .before('authenticate')
    .handler(function (environment, done) {
      if (!environment) return done(cli.errors.MISSING_ENVIRONMENT);
      
      var appName = cli.cwd.getConfig().name;
      
      if (!appName) return done(cli.errors.DIRECTORY_NOT_APP);
      
      var app = cli.api.apps.id(appName);
      
      app.releases.env(environment).get().then(function (releases) {
        var release = _(releases)
          .sortBy(version)
          .last();
        
        cli.log();
        cli.logObject(release.build.files);
        
        done(null, release.build.files);
      });
      
      function version (release) {
        return release.version;
      }
    });
};