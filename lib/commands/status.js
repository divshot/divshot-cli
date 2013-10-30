var prettyPrint = require('pretty-print');
var moment = require('moment');
var async = require('async');

module.exports = function (app) {
  app.program
    .command('status [environment]')
    .description('show release info for each environment')
    .example('status [environment (optional)]')
    .action(function (environment) {
      var config = app.cwd.getConfig();
      var environments = app.environments;
      
      if (!config.name) return app.logger.error('Current directory is not a ' + 'Divshot.io'.blue + ' app');
      if (typeof environment === 'string') environments = [environment];
      
      async.eachSeries(environments, function (env, callback) {
        getReleaseInfo(app, config.name, env, callback);
      });
    });
  
  function getReleaseInfo(app, appName, environment, callback) {
    callback = callback || function () {};
    
    app.api.apps.id(appName).releases.env(environment).get(function (err, releases) {
      var release = app._(releases)
        .sortBy(function (release) { return release.version; })
        .last();
      
      if (!release.build) {
        app.logger.writeln();
        app.logger.info('You haven\'t released anything to ' + environment.bold + ' for ' + appName.bold)
        return callback();
      };
      
      var printObj = {
        'build id': release.build.id,
        'released by': release.author,
        'released on': moment.unix(release.timestamp).format('dddd, MMMM Do YYYY, h:mm:ss a')
      };
      
      app.logger.writeln();
      app.logger.info('Latest ' + environment.bold + ' release for ' + appName.bold);
      app.logger.writeln();
      prettyPrint.object(printObj, 3);
      
      callback(err, release);
    });
  }
};