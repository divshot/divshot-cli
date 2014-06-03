var path = require('path');
var fs = require('fs');
var promptly = require('promptly');
var slug = require('cozy-slug');
var async = require('async');
var slugValidator = require('../validators/slug');
var format = require('chalk');
var mkdirp = require('mkdirp');

module.exports = function (cli) {
  var initDirectory;
  
  cli.command('init <optional app directory>')
    .description('guide to initiate an app in the current directory')
    .handler(function (directory, done) {
      initDirectory = directory;
      
      async.series({
        overwrite: function (callback) {
          if (cli.cwd.hasConfig()) return prompts.overwriteConfig(callback);
          callback(null, true);
        }
      }, function (err, results) {
        if (results.overwrite) initiateConfig(done);
      });
    });

  function initiateConfig (done) {
    cli.log('Initiating a new Divshot app');
    
    async.series({
      name: prompts.name,
      root: prompts.root,
      clean_urls: prompts.cleanUrls,
      error_page: prompts.errorPage,
      createApp: prompts.createApp
    }, buildConfig(function (err, config) {
      
      // Keep the name lowercase
      config.name = config.name.toLowerCase();
      config = generateDefaultPage(config, 'error.html', fs.readFileSync(path.resolve(__dirname, '../templates/not_found.html')).toString());
      config = generateDefaultPage(config, 'index.html', fs.readFileSync(path.resolve(__dirname, '../templates/index.html')).toString());
      config = generateDefaultPage(config, 'divshot.json', JSON.stringify(config, null, 2));
      
      // cli.cwd.setConfig(config);
      cli.log('Application initiated.', {success: true});
      
      done(err, config);
    }));
  }
  
  function generateDefaultPage(config, filename, template) {
    var basepath = path.resolve(process.cwd(), config.root);
    var filepath = path.join(basepath, filename);
    
    mkdirp.sync(basepath);
    
    if (fs.existsSync(filepath)) return config;
    
    fs.writeFileSync(filepath, template);
    
    return config;
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
      var defaultRootTitle = (initDirectory) ? currentDirName() : 'current';
      var defaultRoot = (initDirectory) ? currentDirName() : './';
      promptly.prompt('root directory: (' + defaultRootTitle + ') ', { default: defaultRoot, }, callback);
    },
    
    cleanUrls: function (callback) {
      promptly.confirm('clean urls: (y/n)', callback);
    },
    
    errorPage: function (callback) {
      promptly.prompt('error page: (error.html)', { default: false }, callback);
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
    
    compose: function (rawConfig, callback) {
      var composeConfig = async.compose(
        configComposer.createApp,
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
    
    createApp: function (config, callback) {
      var createApp = config.createApp;
      delete config.createApp;
      
      if (!createApp) return callback(null, configComposer._toggleAttribute(config, 'createApp'));
      
      // Create the apps
      cli.commands.create(config.name, function (err, body) {
        callback(err, configComposer._toggleAttribute(config, 'createApp'));
      }, true);
    }
  };

  // Helpers
  function buildConfig (callback) {
    return function (err, rawConfig) {
      return configComposer.compose(rawConfig, callback);
    };
  }
  
  function currentDirectory () {
    return initDirectory ? path.resolve(process.cwd(), initDirectory) : process.cwd();
  }

  function currentDirName () {
    return initDirectory ? slug(initDirectory) : slug(path.basename(process.cwd()));
  }
};
