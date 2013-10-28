require("colors");

var path = require('path');
var Divshot = require('divshot');
var package = require('../package');
var logger = require('./logger');
var glob = require('glob').sync;
var argv = require('optimist').argv;
var User = require('./user');
var Cwd = require('./cwd');
var app = { config: {} };

app._ = require('lodash');
app.logger = require('./logger');
app.program =  require('commander');
app.config.user = new User(divshotDir());
app.cwd = new Cwd();
app.api = Divshot.createClient({
  token: app.config.user.get('token'),
  host: 'https://api.divshot.com'
  // host: 'http://api.dev.divshot.com:9393'
});
app.environments = ['development', 'staging', 'production'];
app.argv = argv;

app.program
  .version(package.version)
  .option('-v', 'output version number')
  .option('-p, --port', 'set the port')
  .option('-h, --host', 'set the host')
  .on('-v', function () {
    console.log(package.version);
  });

var commands = require('./commands')(app);
app.program.parse(process.argv);


function divshotDir() {
  return path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.divshot')
}


