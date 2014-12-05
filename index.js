var fs = require('fs');
var path = require('path');
var Nash = require('nash');
var homeDir = require('home-dir');
var Divshot = require('divshot-api');
var format = require('chalk');
var User = require('./lib/user');
var Cwd = require('./lib/cwd');
var environments = require('./lib/environments');
var commands = require('./lib/commands');
var errors = require('./lib/errors');
var format = require('chalk');

var API_HOST = process.env.API_HOST || 'https://api.divshot.com';
process.env.DIVSHOT_HASHED_BUCKET || (process.env.DIVSHOT_HASHED_BUCKET = "divshot-io-hashed-production");

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
    host: API_HOST,
    client_id: '526753cf2f55bd0002000006'
  }),
  
  user: user,
  cwd: cwd,
  errors: errors,
  environments: environments,
  timeout: 30000
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
    cli.user.set('token', token, false);
    cli.api.setToken(token);
  });

cli.flag('-v', '--version')
  .description('show the CLI version number')
  .exit(true)
  .handler(function () {
    var package = require('./package.json');
    cli.log(package.version);
  });

cli.flag('-c', '--config')
  .description('use a different config file')
  .handler(function (filename) {
    cli.cwd.setConfigFilename(filename)
  });

cli.flag('--timeout')
  .description('set command timeout, in milliseconds')
  .handler(function (timeout) {
    cli.timeout = timeout;
  });

// Helpers
cli.method('authenticate', function (cli, command, done) {
  if (!cli.user.authenticated()) return done(cli.errors.NOT_AUTHENTICATED);
  done();
});

cli.method('isApp', function (cli, command, next) {
  if(!cli.cwd.getConfig().name) return next(cli.errors.DIRECTORY_NOT_APP);
  next();
});

cli.catchAll(function (type, attemptedCommand) {
  // Undefined command
  if (!attemptedCommand) return cli.commands.help({debug: true});
  
  cli.log();
  cli.log(format.bold('"' + attemptedCommand + '"') + ' is not a Divshot ' + type + '.');
  cli.log('Please use ' + format.bold('"divshot help"') + ' for a list of Divshot commands.');
  cli.log();
  cli.log('Note: you may need to update Divshot in order to use that command: ' + format.bold('npm install -g divshot-cli'));
});

// Add commands
commands.connect(cli);

module.exports = cli;
