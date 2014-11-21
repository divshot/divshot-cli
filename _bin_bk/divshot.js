#!/usr/bin/env node

var cli = require('../index.js');
var updateNotifier = require('update-notifier');
var pkg = require('../package.json');
var updateCheckInterval = 1000 * 60 * 60 * 24 * 7; // 1 week

// Check for update
var notifier = updateNotifier({
  packageName: pkg.name,
  packageVersion: pkg.version,
  updateCheckInterval: updateCheckInterval
});

if (notifier.update) notifier.notify();

cli.run(process.argv);




