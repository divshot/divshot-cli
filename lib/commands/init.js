var path = require('path');
var fs = require('fs');
var async = require('async');
var slug = require('slug');
var promptly = require('promptly');
var slugValidator = require('../validators/slug');

var init = function (app) {
  app.program
    .command('init')
    .description('step by step guide to initiate an app in the current directory')
    .example('init')
    .handler(function () {
      
      async.series({
        overwrite: function (callback) {
          if (app.cwd.hasConfig()) return prompts.overwriteConfig(callback);
          callback(null, true);
        }
      }, function (err, results) {
        if (results.overwrite) initiateConfig(app);
      });
    });
};

function initiateConfig (app) {
  app.logger.writeln();
  app.logger.info('Inititiate a new ' + 'Divshot.io'.blue + ' app.');
  app.logger.writeln();
  
  async.series({
    name: prompts.name,
    root: prompts.root,
    clean_urls: prompts.cleanUrls,
    error_page: prompts.errorPage,
    createApp: prompts.createApp
  }, buildConfig(app, function (err, config) {
      app.cwd.setConfig(config);
      app.logger.success('Divshot.io'.blue + ' app created');
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
    promptly.confirm('Would you like create a Divshot.io app from this app?: (y/n)', callback);
  }
};

// Config composer
var configComposer = {
  _toggleAttribute: function (obj, attr) {
    if (!obj[attr]) delete obj[attr];
    return obj;
  },
  
  compose: function (app, rawConfig, callback) {
    var composeConfig = async.compose(
      configComposer.createApp(app),
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
  
  createApp: function (app) {
    return function (config, callback) {
      var createApp = config.createApp;
      delete config.createApp;
      
      if (createApp) {
        return app.api.apps.create({
          name: config.name
        }, function (err, response) {
          if (err) return app.logger.error(err);
          if (response.error === 'invalid_token') return app.logger.error('You need to log in before you can do this');
          if (response.error && response.error.name) return app.logger.error('The app name ' +response.error.name[0]);
          if (response.status >= 400) return app.logger.error(response.error);
          
          callback(null, configComposer._toggleAttribute(config, 'createApp'));
        });
      }
      
      callback(null, configComposer._toggleAttribute(config, 'createApp'));
    };
  }
};

// Helpers
function buildConfig (app, callback) {
  return function (err, rawConfig) {
    return configComposer.compose(app, rawConfig, callback);
  };
}

function currentDirName () {
  return slug(path.basename(process.cwd()));
}

// Exports
init.configComposer = configComposer;
init.prompts = prompts;
module.exports = init;