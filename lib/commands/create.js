var fs = require('fs');
var path = require('path');
var request = require('request');
var regular = require('regular');
var cli = require('../divshot');
var logger = require('../logger');
var appConfig = require('../app_config');

var internals = {};

internals.userConfig = cli.config.stores.user;

internals.schema = {
  properties: {
    name: {
      pattern: regular.slug,
      required: true
    }
  }
};

internals.promptForName = function (callback) {
  cli.prompt.get(internals.schema, function (err, result) {
    callback(null, result.name);
  });
};

internals.forceAppName = function (callback) {
  var _cb = function (cliCallback) {
    return function (name) {
      callback(name, cliCallback);
    }
  };
  
  return function (appName, cliCallback) {
    var _callback = _cb(cliCallback);
    
    appConfig.getAll(function (err, config) {
      if (appName) {
        return _callback(appName);
      }
      
      var _config = config || {};
      
      // No config file or no name in config file
      if (err || !_config.name) {
        return internals.promptForName(function (err, name){
          _callback(name);
        });
      }
      
      // divshot.json with app name
      if (_config.name) {
        logger.info('Creating app ' + _config.name.bold + ' from divshot.json file configuration ...');
        return _callback(_config.name);
      }
    });
  };
};

var create = module.exports = internals.forceAppName(function (appName, callback) {
  cli.api.apps.create({
    name: appName
  }, function (err, response) {
    if (err) {
      return logger.error(err);
    }
    
    if (response.error && response.error.name) {
      return logger.error('The app name ' +response.error.name[0]);
    }
    
    appConfig.set('name', appName, function (err) {
      if (err) {
        logger.err(err);
      }
      
      logger.success(appName + ' has been created');
    });
    
  });
});


create.internals = internals;
create.usage = ['Create a Divshot.io app'];


/*
divshot create app-name
but if they don't supply an app name
prompt them for one
 */
// 