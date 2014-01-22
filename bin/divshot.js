#!/usr/bin/env node

var path = require('path');
var mkdirp = require('mkdirp');
var feedback = require('feedback');
var chalk = require('chalk');
var startApp = require('../lib/divshot');
var homdeDir = require('home-dir');

// Create our .divshot directory
mkdirp(path.join(homdeDir(), '.divshot', 'config'), function (err) {
  if (err) {
    return feedback.error('Looks like we don\'t have access to your home directory. Please adjust your permissions before you continue');
  }
  
  startApp({
   host: 'https://api.divshot.com',
    // host: 'http://api.dev.divshot.com:9393'
  });
});

process.on('uncaughtException', function (err) {
  feedback.error(err.message);
  console.log(chalk.red('Stack: ') + err.stack);
  
  process.exit(1);
});
