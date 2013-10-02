var flatiron = require('flatiron');
var path = require('path');
var app = module.exports = flatiron.app;

app.config.argv().env();
app.config.add('user', {
  type: 'file',
  file: path.resolve(__dirname, 'userconfig.json')
});

app.use(flatiron.plugins.cli, {
  source: path.join(__dirname, 'commands'),
  usage: 'Empty Flatiron Application, please fill out commands'
});

process.on('uncaughtException', function(err) {
  console.log(err.message.red);
  process.exit(1);
});
