var path = require('path');
var fs = require('fs');
var async = require('async');
var slug = require('slug');
var promptly = require('promptly');
var yesNoValidator = require('../validators/yes_no');
var slugValidator = require('../validators/slug');

module.exports = function (app) {
  app.program
    .command('init')
    .description('inititiate an app in the current directory')
    .action(function () {
      
      // TODO: detect if config file exists already
      
      // TODO: Intro text
      
      async.series({
        name: function (callback) {
          promptly.prompt('name: (' + currentDirName() + ')', {
            default: currentDirName(),
            validator: slugValidator
          }, callback);
        },
        root: function (callback) {
          promptly.prompt('app directory: (current) ', { default: './', }, callback);
        },
        clean_urls: function (callback) {
          
          // TODO: convert to promptly.confirm
          
          promptly.prompt('clean urls: (y/n)', {
            default: false,
            validator: yesNoValidator
          }, callback);
        },
        error_page: function (callback) {
          promptly.prompt('error page: (none)', { default: false }, callback);
        },
        createApp: function (callback) {
          
          // TODO: convert to promptly.confirm
          
          promptly.prompt('Would you like create a Divshot.io app from this app?: (y/n)', {
            default: false,
            validator: yesNoValidator
          }, callback)
        }
      }, function (err, rawConfig) {
        var buildConfig = async.compose(
          createApp(app),
          setDefaults,
          generateErrorPage,
          toggleCleanUrls
        );
        
        app.cwd.filePath = path.join(path.resolve(process.cwd(), rawConfig.root), 'divshot.json');
        
        buildConfig(rawConfig, function (err, config) {
          app.cwd.setConfig(config);
          app.logger.success('Divshot.io'.blue + ' app created');
        });
      });
    });
};

function currentDirName () {
  return slug(path.basename(process.cwd()));
}

function generateErrorPage (config, callback) {
  
  // TODO: generate default error page if they don't provide one
  
  callback(null, toggleAttribute(config, 'error_page'));
}

function createApp (app) {
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
        
        callback(null, toggleAttribute(config, 'createApp'));
      });
    }
    
    callback(null, toggleAttribute(config, 'createApp'));
  };
}

function toggleCleanUrls (config, callback) {
  callback(null, toggleAttribute(config, 'clean_urls'));
}

function setDefaults (config, callback) {
  if (!config.cache_control) config.cache_control = {};
  if (!config.routes) config.routes = {};
  callback(null, config);
}

function toggleAttribute (obj, attr) {
  if (!obj[attr]) delete obj[attr]
  return obj
}