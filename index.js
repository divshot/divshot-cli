var fs = require('fs');
var path = require('path');
var Nash = require('nash');
var homeDir = require('home-dir');
var Divshot = require('divshot');
var User = require('./lib/user');
var Cwd = require('./lib/cwd');
var commands = require('./lib/commands');
var errors = require('./lib/errors');

var API_HOST = 'https://api.divshot.com';

var cliConfigDirectory = path.join(homeDir(), '.divshot');
var user = new User(cliConfigDirectory);
var cwd = new Cwd();
var title = fs.readFileSync(__dirname + '/lib/help/logo.txt')
var description = [
  'Application-Grade Static Web Hosting.\n  ',
  '  Host single-page apps and static sites with',
  '  all the power of a modern application platform.'
].join('\n');

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
  config: cwd.getConfig(),
  errors: errors
});

// Flags
cli.flag('-a', '--app')
  .description('override the directory\'s app name')
  .handler(function (appName) {});

cli.flag('-t', '--token')
  .description('override your current user authentication token')
  .handler(function (token) {});

// Helpers
cli.helper('authenticate', function (command, done) {
  if (!cli.user.authenticated()) return done(cli.errors.NOT_AUTHENTICATED);
  done();
});

commands.connect(cli);

module.exports = cli;