var _ = require('lodash');
var format = require('chalk');
var moment = require('moment');
var async = require('async');

exports.require = ['authenticate', 'config'];

exports.register = function (environment) {
  var command = this;
  
  // Single
  if (environment) return getEnvironmentReleases(command.config.name, environment); 
  
  // All
  async.eachSeries(command.environments, function (env, done) {
    getIndividualReleaseInfo(command.config.name, env, done);
  }, function (err, releases) {
    if (err) return command.error(command.errors.DEFAULT);
    command.done(null, releases)
  });
  
  function getIndividualReleaseInfo(appName, environment, callback) {
    callback = callback || function () {};
    
    getReleases(appName, environment, function (err, releases) {
      var release = _.last(releases);
      
      if (!release || !release.build) {
        command.update();
        command.update('You haven\'t released anything to ' + format.bold(environment) + ' for ' + format.bold(appName));
        return callback();
      }
      
      command.update('Latest ' + format.bold(environment) + ' release for ' + format.bold(appName));
      printRelease(release, appName, environment);
      
      callback(err, release);
    });
  }
  
  function getEnvironmentReleases (appName, environment) {
    getReleases(appName, environment, function (err, releases) {
      command.update(format.bold(environment) + ' releases for ' + format.bold(appName));
      
      _.each(releases, function (release) {
        printRelease(release, appName, environment);
      });
      
      command.done(null, releases);
    });
  }

  function getReleases (appName, environment, callback) {
    command.api.apps.id(appName).releases.env(environment).get(function (err, releases) {
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
    
    command.update();
    command.updateObject(printObj, {padding: 3});
  }
};
