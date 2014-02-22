var fs = require('fs');
var path = require('path');
var Nash = require('nash');
var homeDir = require('home-dir');
var Divshot = require('divshot');
var format = require('chalk');
var User = require('./lib/user');
var Cwd = require('./lib/cwd');
var commands = require('./lib/commands');
var errors = require('./lib/errors');

var API_HOST = 'https://api.divshot.com';

var cliConfigDirectory = path.join(homeDir(), '.divshot');
var user = new User(cliConfigDirectory);
var cwd = new Cwd();
var title = fs.readFileSync(__dirname + '/lib/logo.txt')
var description = [
  'Application-Grade Static Web Hosting\n  ',
  '  Host single-page apps and static sites with',
  '  all the power of a modern application platform.'
].join('\n');

// Set up CLI
var cli = Nash.createCli({
  title: title,
  description: description,
  color: 'yellow',
  
  api: Divshot.createClient({
    token: user.get('token'),
    host: API_HOST
  }),
  user: user,
  cwd: cwd,
  errors: errors
});

// Flags
cli.flag('-a', '--app')
  .description('override the directory\'s app name')
  .handler(function (appName) {
    cwd.overrideAppName(appName);
  });

cli.flag('-t', '--token')
  .description('override your current user authentication token')
  .handler(function (token) {
    cli.user.set('token', token);
    cli.api.setToken(token);
  });

// Helpers
cli.method('authenticate', function (command, done) {
  if (!cli.user.authenticated()) return done(cli.errors.NOT_AUTHENTICATED);
  done();
});

cli.catchAll(function (type, attemptedCommand) {
  cli.log();
  cli.log(format.bold('"' + attemptedCommand + '"') + ' is not a Divshot ' + type + '.');
  cli.log('Please use ' + format.bold('"divshot help"') + ' for a list of Divshot commands.');
});

// 
// TODO: make a secret(true) method for commands to hide from help
// list

// Add commands
commands.connect(cli);

module.exports = cli;