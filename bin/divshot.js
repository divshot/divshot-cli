#!/usr/bin/env node

var path = require('path');
var mkdirp = require('mkdirp');

process.env.NODE_ENV = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'production';

var env = require('../lib/env');
var _defaults = require('lodash.defaults');
var divshotCli = require('../lib/divshot');
var divshotDir = path.join(getUserHome(), '.divshot', 'config');
var logger = require('../lib/logger');

_defaults(process.env, env);

// Create our .divshot directory
mkdirp(divshotDir, function (err) {
  if (err) {
    return logger.error('Looks like we don\'t have access to your home directory. Please adjust your permissions before you continue');
  }
  
  divshotCli.start();
});


function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}