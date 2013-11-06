var path = require('path');
var Divshot = require('divshot');
var glob = require('glob').sync;
var _ = require('lodash');
var package = require('../package');
var feedback = require('feedback');
var User = require('./user');
var Cwd = require('./cwd');
var loading = require('./helpers/loading');
var command = require('./helpers/command');
var program = require('./program');
var initCommands = require('./commands');

module.exports = function (overrides) {
  overrides || (overrides = {});
  
  var app = {};
  
  app.loading = loading;
  app._ = _;
  app.logger = feedback;
  app.user = new User();
  app.cwd = new Cwd();
  app.api = Divshot.createClient({
    token: app.user.get('token'),
    host: 'https://api.divshot.com'
    // host: 'http://api.dev.divshot.com:9393'
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
    });

  initCommands(app);
  app.program.parse(process.argv);
  
  return _.extend(app, overrides);
};
