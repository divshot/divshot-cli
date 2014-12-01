var _ = require('lodash');
var nash = require('nash');
var homeDir = require('home-dir');
var fs = require('fs-extra');
var join = require('join-path');

var config = require('./config');
var user = require('./user');
var api = require('./api');
var errors = require('./errors');

var requireCommands = require('./commands');

var API_HOST = 'https://api.divshot.com';

module.exports = function divshot (spec) {
  
  spec = spec || {};
  
  var apiOrigin = (spec.api) ? spec.api.origin || API_HOST : API_HOST;
  var configRoot = spec.configRoot || homeDir('.divshot');
  var _user = user({file: join(configRoot, 'config', 'user.json')}); // TODO: custom config file path from divshot()?
  var _config = config({
    file: ['divshot.json', 'superstatic.json']
  }); // TODO: custom config file from divshot()?
  var _api = api({
    user: _user,
    origin: apiOrigin
  });
  
  var members = {
    configRoot: configRoot,
    api: _api,
    local: {
      config: _config,
      user: _user,
    },
    cleanCache: cleanCache
  };
  
  // Add commands to members and return
  return _.extend(members, requireCommands({
    user: members.local.user,
    config: members.local.config,
    api: members.api,
    errors: errors
  }));
  
  function cleanCache () {
    
    fs.removeSync(members.configRoot);
    
    return members;
  }
};