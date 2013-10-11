var flatiron = require('flatiron');
var path = require('path');
var app = module.exports = flatiron.app;
var Divshot = require('divshot');
var env = require('./env');
var logger = require('./logger')

app.config.argv({
  'm': {
    alias: 'message',
    describe: 'Add a note to your release',
    demand: false
  }
}).env();
app.config.add('user', {
  type: 'file',
  file: path.resolve(__dirname, 'config', 'user.json')
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
