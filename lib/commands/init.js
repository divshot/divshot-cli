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
          promptly.prompt('clean urls: (y/n)', {
            default: false,
            validator: yesNoValidator
          }, callback);
        },
        error_page: function (callback) {
          promptly.prompt('error page: (none)', { default: false }, callback);
        },
        createApp: function (callback) {
          promptly.prompt('Would you like create a Divshot.io app from this app?: (y/n)', {
            default: false,
            validator: yesNoValidator
          }, callback)
        }
      }, function (err, rawConfig) {
        var composeConfig = app._.compose(
          stringifyConfig,
          createApp(app),
          setDefaults,
          generateErrorPage,
          toggleCleanUrls
        );
        
        var config = composeConfig(rawConfig);
        var configFilePath = path.join(path.resolve(process.cwd(), rawConfig.root), 'divshot.json');
        
        fs.writeFileSync(configFilePath, config);
        
        app.logger.writeln();
        app.logger.success('Divshot.io'.blue + ' app created');
      });
    });
};

function currentDirName () {
  return slug(path.basename(process.cwd()));
}

function stringifyConfig (config) {
  return JSON.stringify(config, null, 2);
}

function generateErrorPage (config) {
  
  // TODO: generate default error page if they don't provide one
  
  return toggleAttribute(config, 'error_page');
}

function createApp (app) {
  return function (config) {
    if (config.createApp) {
      // app.command('create').action(config.name);
    }
    
    return toggleAttribute(config, 'createApp');
  };
}

function toggleCleanUrls (config) {
  return toggleAttribute(config, 'clean_urls');
}

function setDefaults (config) {
  if (!config.cache_control) config.cache_control = {};
  if (!config.routes) config.routes = {};
  return config;
}

function toggleAttribute (obj, attr) {
  if (!obj[attr]) delete obj[attr]
  return obj
}