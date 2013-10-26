require("colors");

var path = require('path');
var Divshot = require('divshot');
var package = require('../package');
var logger = require('./logger');
var glob = require('glob').sync;
var divshotDir = path.join(getUserHome(), '.divshot');
var env = require('./env');
var User = require('./config/user');

var app = {
  config: {}
};

app._ = require('lodash');
app.logger = require('./logger');
app.program =  require('commander');
app.config.user = new User(divshotDir);
app.api = Divshot.createClient({
  token: app.config.user.get('token'),
  // host: 'https://api.divshot.com'
  host: 'http://api.dev.divshot.com:9393'
});

app.program
  .version(package.version)
  .option('-v', 'output version number');

app.program.on('-v', function () {
  console.log(package.version);
});

var commands = require('./commands')(app);
app.program.parse(process.argv);

/*
    X apps: List your apps
  create: Create a Divshot.io app
 destroy: Delete a Divshot.io app
   X login: Login to the Divshot api
  X logout: Logout of Divshot
 promote: Promote this app from one environment to another
 release: Release current app to and environment.
rollback: Rollback current app to previous environment
  server: Serve this app locally
 */

// var token = userConfig.get('token');



process.on('uncaughtException', function(err) {
  logger.error(err.message);
  process.exit(1);
});

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}


