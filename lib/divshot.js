var flatiron = require('flatiron');
var path = require('path');
var app = module.exports = flatiron.app;
var Divshot = require('divshot');
var env = require('./env');

app.config.argv().env();
app.config.add('user', {
  type: 'file',
  file: path.resolve(__dirname, 'config', 'user.json')
});

app.use(flatiron.plugins.cli, {
  source: path.join(__dirname, 'commands'),
  usage: 'Empty Flatiron Application, please fill out commands'
});

var userConfig = app.config.stores.user;
app.api = Divshot.createClient({
  token: userConfig.get('token'),
  host: env.API_HOST
});

process.on('uncaughtException', function(err) {
  console.log(err.message.red);
  process.exit(1);
});
