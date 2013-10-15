var flatiron = require('flatiron');
var path = require('path');

var Divshot = require('divshot');

var app = module.exports = flatiron.app;
var env = require('./env');
var logger = require('./logger');
var divshotDir = path.join(getUserHome(), '.divshot');
var glob = require('glob').sync;
require("colors");

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

app.cmd("help", function() {
  console.info("For additional help, run:".underline + " divshot help <commandname>".blue);
  console.info("Available commands:".green);
  var longestCommandName = 0;
  var commands = glob(path.join(__dirname, 'commands') + "/*.js")
    .map(function(pathname){
      var commandName = pathname.replace(path.join(__dirname, 'commands/'), '').replace(".js", "");
      if (commandName.length > longestCommandName) {
        longestCommandName = commandName.length;
      }
      return [pathname, commandName];
    });

  commands.forEach(function(command) {
    var definition = require(command[0]);
    var lpad = new Array(longestCommandName - command[1].length + 1).join(" ");
    console.info(lpad + command[1].blue + ": " + definition.usage);
  });
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


