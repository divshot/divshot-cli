var path = require('path');
var fs = require('fs');
var promptly = require('promptly');
var slug = require('cozy-slug');
var async = require('async');
var slugValidator = require('../validators/slug');
var format = require('chalk');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var copy = require('copy-files');

module.exports = function (cli) {
  cli.command('init <optinal app directory>')
    .description('guide to initiate an app')
    .handler(function (directory, done) {
      if (directory) cli.cwd.setCwd(directory);
      
      var prompts = {
        overwrite: function (callback) {
          if (!cli.cwd.hasConfig()) return callback(null, true);
          
          promptly.confirm('Configuration file already exists. Overwrite?: (y/n)', function (err, overwrite) {
            if (overwrite) return callback(err, overwrite);
            process.exit(0);
          });
        },
        
        name: function (callback) {
          promptly.prompt('name: (' + currentDirName() + ')', {
            default: currentDirName(),
            validator: slugValidator
          }, callback);
        },
        
        root: function (callback) {
          var defaultRootTitle = (directory) ? currentDirName() : 'current';
          var defaultRoot = './';
          promptly.prompt('root directory: (' + defaultRootTitle + ') ', { default: defaultRoot, }, callback);
        },
        
        cleanUrls: function (callback) {
          promptly.confirm('clean urls: (y/n)', callback);
        },
        
        errorPage: function (callback) {
          var defaultPageName = 'error.html';
          promptly.prompt('error page: (' + defaultPageName + ')', { default: defaultPageName }, callback);
        },
        
        createApp: function (callback) {
          promptly.confirm('Would you like to create a Divshot.io app from this app?: (y/n)', callback);
        }
      };
      
      async.series({
        overwrite: prompts.overwrite,
        name: prompts.name,
        root: prompts.root,
        clean_urls: prompts.cleanUrls,
        error_page: prompts.errorPage,
        createApp: prompts.createApp
      }, createApplicationFiles);
      
      function createApplicationFiles(err, options) {
        var config = _.omit(options, ['overwrite', 'createApp']);
        
        mkdirp.sync(cli.cwd.cwd); // Create working app directory
        cli.cwd.setConfig(config, options.overwrite); // Create app config file
        generateDefaultFiles(config);
        
        if (options.createApp) createApp(config);
        else cli.log('App initiated', {success: true});
      }
      
      function generateDefaultFiles (config, done) {
        var filesToCopy = {};
        filesToCopy[config.error_page] = path.resolve(__dirname, '../templates/error.html');
        filesToCopy['index.html'] = path.resolve(__dirname, '../templates/index.html');
        
        copy({
          files: filesToCopy,
          dest: path.resolve(cli.cwd.cwd, config.root),
          overwrite: false
        }, done);
      }
      
      function createApp (config) {
        cli.commands.create(config.name, function (err, body) {
          if (err) return cli.error(err);
          cli.log('App initiated', {success: true});
        }, true);
      }
    });
  
  function currentDirName () {
    return slug(path.basename(cli.cwd.cwd));
  }
};
