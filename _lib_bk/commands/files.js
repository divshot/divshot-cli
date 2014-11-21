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
        
        var lastRelease = _(releases)
          .sortBy(version)
          .last();
        
        var files = fileList(lastRelease);
        
        cli.log();
        cli.logObject(files, {leftPadding: 2});
        
        done(null, files);
      });
      
      function fileList (release) {
        
        var files = (release.build.file_mapped)
          ? hashedFilelist(release)
          : nonHashedFileList(release)
        
        return _.sortBy(files, function (name) {
          return name.toLowerCase();
        });
      }
      
      function hashedFilelist (release) {
        
        return _.keys(release.build.file_map);
      }
      
      function nonHashedFileList (release) {
        
        return release.build.files;
      }
      
      function version (release) {
        
        return release.version;
      }
    });
};