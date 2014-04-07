var fs = require('fs');
var path = require('path');
var Nash = require('nash');
var homeDir = require('home-dir');
var Divshot = require('divshot-api');
var format = require('chalk');
var User = require('./lib/user');
var Cwd = require('./lib/cwd');
var environments = require('./lib/environments');
var Package = require('./lib/package');
var commands = require('./lib/commands');
var errors = require('./lib/errors');
var semver = require('semver');
var format = require('chalk');

var API_HOST = process.env.API_HOST || 'https://api.divshot.com';

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
  package: new Package(user),
  errors: errors,
  environments: environments
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

// Helpers
cli.method('authenticate', function (command, done) {
  if (!cli.user.authenticated()) return done(cli.errors.NOT_AUTHENTICATED);
  done();
});

cli.method('version', function (command, done) {
  cli.package.hasLatestVersion(function (err, hasLatestVersion) {
    if (!hasLatestVersion) {
      cli.log();
      cli.log(format.yellow('Attention: ') + 'A new version of Divshot CLI availble (' + cli.package.version + ').\nUpdate with ' + format.bold('"npm install divshot-cli -g"'));
      cli.log();
    }
    
    done();
  });
});

// FIXME: Stopped working
// cli.beforeAll('version');

cli.catchAll(function (type, attemptedCommand) {
  // Undefined command
  if (!attemptedCommand) return cli.commands.help({debug: true});
  
  cli.log();
  cli.log(format.bold('"' + attemptedCommand + '"') + ' is not a Divshot ' + type + '.');
  cli.log('Please use ' + format.bold('"divshot help"') + ' for a list of Divshot commands.');
  cli.log()
  cli.log('Note: you may need to update Divshot in order to use that command: ' + format.bold('npm install -g divshot-cli'));
});

// 
// TODO: make a secret(true) method for commands to hide from help
// list

// Add commands
commands.connect(cli);

module.exports = cli;