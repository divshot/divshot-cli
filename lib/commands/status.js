var _ = require('lodash');
var format = require('chalk');
var moment = require('moment');
var async = require('async');

module.exports = function (cli) {
  var command = cli.command('status <optional environment>');
  
  command.before('authenticate', 'isApp');
  command.description('show release info for each environment');
  command.handler(function (environment, done) {
    var appName = cli.cwd.getConfig().name;
    
    // Single
    if (environment) return getEnvironmentReleases(appName, environment); 
    
    // All
    async.eachSeries(cli.environments, function (env, next) {
      getIndividualReleaseInfo(appName, env, next);
    }, function (err, releases) {
      if (err) return done(cli.errors.DEFAULT);
      done(null, releases)
    });
    
    function getIndividualReleaseInfo(appName, environment, callback) {
      callback = callback || function () {};
      
      getReleases(appName, environment, function (err, releases) {
        var release = _.last(releases);
        
        if (!release || !release.build) {
          cli.log();
          cli.log('You haven\'t released anything to ' + format.bold(environment) + ' for ' + format.bold(appName));
          return callback();
        }
        
        cli.log();
        cli.log('Latest ' + format.bold(environment) + ' release for ' + format.bold(appName));
        printRelease(release, appName, environment);
        callback(err, release);
      });
    }
    
    function getEnvironmentReleases (appName, environment) {
      getReleases(appName, environment, function (err, releases) {
        cli.log();
        
        if (err) return done(err);
        if (releases[0] == 403) return done(releases[1]);
        if (releases[0] === 404) return done(releases[1]);
        
        cli.log();
        cli.log(format.bold(environment) + ' releases for ' + format.bold(appName));
        
        _.each(releases, function (release) {
          printRelease(release, appName, environment);
        });
        
        done(null, releases);
      });
    }

    function getReleases (appName, environment, callback) {
      cli.api.apps.id(appName).releases.env(environment).get(function (err, releases) {
        callback(err, _.sortBy(releases, function (release) { return release.version; }));
      });
    }

    function printRelease (release, appName, environment) {
      var printObj = {
        'release #': release.version,
        'build id': release.build.id,
        'released by': release.author,
        'released on': moment.unix(release.timestamp).format('dddd, MMMM Do YYYY, h:mm:ss a')
      };
      
      cli.log();
      cli.logObject(printObj, {rightPadding: 3});
    }
  });
};