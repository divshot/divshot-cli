var path = require('path');
var fs = require('fs');
var promptly = require('promptly');
var slug = require('slug');
var async = require('async');
var slugValidator = require('../../validators/slug');
var format = require('chalk');

exports.require = ['cwd'];

exports.description = 'guide to initiate an app in the current directory';

exports.register = function () {
  var command = this;
  
  async.series({
    overwrite: function (callback) {
      if (command.cwd.hasConfig()) return prompts.overwriteConfig(callback);
      callback(null, true);
    }
  }, function (err, results) {
    if (results.overwrite) initiateConfig(command);
  });
};

function initiateConfig (command) {
  command.update('Inititiate a new ' + format.blue('Divshot.io') + ' app.');
  
  async.series({
    name: prompts.name,
    root: prompts.root,
    clean_urls: prompts.cleanUrls,
    error_page: prompts.errorPage,
    createApp: prompts.createApp
  }, buildConfig(command, function (err, config) {
      command.cwd.setConfig(config);
      command.done(null, config);
  }));
}

// Prompts
var prompts = {
  overwriteConfig: function (callback) {
    promptly.confirm('Configuration file already exists. Overwrite?: (y/n)', callback);
  },
  
  name: function (callback) {
    promptly.prompt('name: (' + currentDirName() + ')', {
      default: currentDirName(),
      validator: slugValidator
    }, callback);
  },
  
  root: function (callback) {
    promptly.prompt('app directory: (current) ', { default: './', }, callback);
  },
  
  cleanUrls: function (callback) {
    promptly.confirm('clean urls: (y/n)', callback);
  },
  
  errorPage: function (callback) {
    promptly.prompt('error page: (url or path)', { default: false }, callback);
  },
  
  createApp: function (callback) {
    promptly.confirm('Would you like to create a Divshot.io app from this app?: (y/n)', callback);
  }
};

// Config composer
var configComposer = {
  _toggleAttribute: function (obj, attr) {
    if (!obj[attr]) delete obj[attr];
    return obj;
  },
  
  compose: function (command, rawConfig, callback) {
    var composeConfig = async.compose(
      configComposer.createApp(command),
      configComposer.setDefaults,
      configComposer.toggleErrorPage,
      configComposer.toggleCleanUrls
    );
    
    composeConfig(rawConfig, callback);
  },
  
  toggleCleanUrls: function (config, callback) {
    callback(null, configComposer._toggleAttribute(config, 'clean_urls'));
  },
  
  setDefaults: function (config, callback) {
    if (!config.cache_control) config.cache_control = {};
    if (!config.routes) config.routes = {};
    callback(null, config);
  },
  
  toggleErrorPage: function (config, callback) {
    callback(null, configComposer._toggleAttribute(config, 'error_page'));
  },
  
  createApp: function (command) {
    return function (config, callback) {
      var createApp = config.createApp;
      delete config.createApp;
      
      if (!createApp) callback(null, configComposer._toggleAttribute(config, 'createApp'));
      
      // Create the apps
      command.execute.create(config.name, {debug: true}, function (err, body) {
        if (err) return command.error(err);
        callback(null, configComposer._toggleAttribute(config, 'createApp'));
      });
    };
  }
};

// Helpers
function buildConfig (command, callback) {
  return function (err, rawConfig) {
    return configComposer.compose(command, rawConfig, callback);
  };
}

function currentDirName () {
  return slug(path.basename(process.cwd()));
}