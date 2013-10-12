var flatiron = require('flatiron');
var path = require('path');

var Divshot = require('divshot');

var app = module.exports = flatiron.app;
var env = require('./env');
var logger = require('./logger');
var divshotDir = path.join(getUserHome(), '.divshot');

app.config.argv({
  'm': {
    alias: 'message',
    describe: 'Add a note to your release',
    demand: false
  }
}).env();

app.config.add('user', {
  type: 'file',
  file: path.join(divshotDir, 'config', 'user.json')
});

app.use(flatiron.plugins.cli, {
  source: path.join(__dirname, 'commands'),
  usage: 'Divshot Command Line Interface'
});

var userConfig = app.config.stores.user;
var token = userConfig.get('token');

app.api = Divshot.createClient({
  token: userConfig.get('token'),
  host: env.API_HOST
});

process.on('uncaughtException', function(err) {
  logger.error(err.message);
  process.exit(1);
});

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}


