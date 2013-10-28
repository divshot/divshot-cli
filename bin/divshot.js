#!/usr/bin/env node

var path = require('path');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var logger = require('../lib/logger');

process.env.NODE_ENV = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'production';

var env = require('../lib/env');
var divshotDir = path.join(getUserHome(), '.divshot', 'config');

_.defaults(process.env, env);

// Create our .divshot directory
mkdirp(divshotDir, function (err) {
  if (err) {
    return logger.error('Looks like we don\'t have access to your home directory. Please adjust your permissions before you continue');
  }
  
  require('../lib/divshot');
});


function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}