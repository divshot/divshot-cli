var flatiron = require('flatiron');
var path = require('path');
var app = module.exports = flatiron.app;
var env = require('./env');

app.config.file({ file: path.resolve(__dirname, '../config', 'config.json') });
app.config.set('env', env);

app.use(flatiron.plugins.cli, {
  source: path.join(__dirname, 'commands'),
  usage: 'Empty Flatiron Application, please fill out commands'
});

process.on('uncaughtException', function(err) {
  console.log(err.message);
  process.exit(1);
});
