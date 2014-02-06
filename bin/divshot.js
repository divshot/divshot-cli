#!/usr/bin/env node

var divshot = require('../lib');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));

// Run command
divshot(divshot._command(argv));

// divshot.config.add('me', 'you', function () {});
// divshot.config.remove('me', function () {});

// divshot.apps(function (err, apps) {
//   console.log('callback done');
// });

// divshot.auth.token(function (err, token) {
//   console.log(token);
// });

// divshot.create('app-name', {/*options here*/}, function (err, apps) {
  
// });






























// var path = require('path');
// var mkdirp = require('mkdirp');
// var feedback = require('feedback');
// var chalk = require('chalk');
// var cli = require('../lib/divshot');
// var homdeDir = require('home-dir');

// // Create our .divshot directory
// mkdirp(path.join(homdeDir(), '.divshot', 'config'), function (err) {
//   if (err) {
//     return feedback.error('Looks like we don\'t have access to your home directory. Please adjust your permissions before you continue');
//   }
  
//   cli({
//    host: 'https://api.divshot.com',
//     // host: 'http://api.dev.divshot.com:9393'
//   });
// });

// process.on('uncaughtException', function (err) {
//   feedback.error(err.message);
//   console.log(chalk.red('Stack: ') + err.stack);
  
//   process.exit(1);
// });





// var divshot = reqiure('../lib');
// // var command = something.split(':');
// var args = [];

// divshot({
//   command: 'domains',
//   args: []
//   task: 'add',
// }, function () {
  
// });

// divshot.domains.add('www.divshot.com', args, function (err) {
  
// });




// module.exports = function (options, update, done) {
//   var appName = options.args.app;
//   var domainName = options.args[0];
  
//   update('My message here', {
//     type: 'success'
//   });
  
//   done();
// };