var print = require('pretty-print');
var moment = require('moment');
var async = require('async');

module.exports = function (app) {
  app.program
    .command('status [environment]')
    .description('show release info for each environment')
    .example('status [environment (optional)]')
    .withConfig()
    .withAuth()
    .handler(function (environment) {
      var config = this.config;
      
      // Single
      if (environment) return getEnvironmentReleases(app, config.name, environment); 
      
      // All
      async.eachSeries(app.environments, function (env, callback) {
        getIndividualReleaseInfo(app, config.name, env, callback);
      });
    });
  
  function getIndividualReleaseInfo(app, appName, environment, callback) {
    callback = callback || function () {};
    
    getReleases(app, appName, environment, function (err, releases) {
      var release = app._.last(releases);
      
      if (!release || !release.build) {
        app.logger.writeln();
        app.logger.info('You haven\'t released anything to ' + app.format.bold(environment) + ' for ' + app.format.bold(appName));
        return callback();
      }
      
      app.logger.writeln();
      app.logger.info('Latest ' + app.format.bold(environment) + ' release for ' + app.format.bold(appName));
      printRelease(app, release, appName, environment);
      
      callback(err, release);
    });
  }
  
  function getEnvironmentReleases (app, appName, environment) {
    getReleases(app, appName, environment, function (err, releases) {
      app.logger.writeln();
      app.logger.info(app.format.bold(environment) + ' releases for ' + app.format.bold(appName));
      
      app._.each(releases, function (release) {
        printRelease(app, release, appName, environment);
      });
    });
  }
  
  function getReleases (app, appName, environment, callback) {
    app.api.apps.id(appName).releases.env(environment).get(function (err, releases) {
      callback(err, app._.sortBy(releases, function (release) { return release.version; }));
    });
  }
  
  function printRelease (app, release, appName, environment) {
    var printObj = {
      'release #': release.version,
      'build id': release.build.id,
      'released by': release.author,
      'released on': moment.unix(release.timestamp).format('dddd, MMMM Do YYYY, h:mm:ss a')
    };
    
    app.logger.writeln();
    print(printObj, {padding: 3});
  }
};