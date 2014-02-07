#!/usr/bin/env node

var divshot = require('../lib');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));

// Run command
divshot(divshot._command(argv));