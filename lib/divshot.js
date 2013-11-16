var path = require('path');
var Divshot = require('divshot');
var glob = require('glob').sync;
var _ = require('lodash');
var homeDir = require('home-dir');
var package = require('../package');
var feedback = require('feedback');
var User = require('./user');
var Cwd = require('./cwd');
var loading = require('./helpers/loading');
var command = require('./helpers/command');
var program = require('./program');
var initCommands = require('./commands');
var configDir = path.join(homeDir(), '.divshot');

module.exports = function (options) {
  var app = {};
  
  app.loading = loading;
  app._ = _;
  app.logger = feedback;
  app.user = new User(configDir);
  app.cwd = new Cwd();
  app.api = Divshot.createClient({
    token: app.user.get('token'),
    host: options.host
  });
  app.environments = ['development', 'staging', 'production'];
  app.command = command(app);
  app.program = program(app.api, app.user, app.cwd);

  app.program
    .version(package.version)
    .option('-v', 'output version number')
    .option('-p, --port [port]', 'set the port')
    .option('--host [host]', 'set the host')
    .option('--token [token]', 'manually pass access token')
    .option('--app [app]', 'manually supply the ' + 'Divshot.io'.blue + ' app name')
    .option('--no-color', 'strip all use of color in output')
    .on('-v', function () {
      app.logger.info(package.version);
      process.exit(0);
    });

  initCommands(app);
  app.program.parse(process.argv);

  // If no arguments given, show help (without exiting).
  if (!app.program.args.length) app.program.outputHelp();

  return _.extend(app, options);
};
