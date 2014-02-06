var path = require('path');
var format = require('chalk');
var feedback = require('feedback');
var homeDir = require('home-dir');
var commands = require('./commands');
var errors = require('./errors');
var User = require('./user');
var Cwd = require('./cwd');
var Divshot = require('divshot');
var print = require('pretty-print');
var createShortcuts = require('./create_shortcuts');

var cliConfigDirectory = path.join(homeDir(), '.divshot');
var API_HOST = 'https://api.divshot.com';

function divshot (options, callback) {
  var command = commands[options.command];
  var user = new User(cliConfigDirectory);
  var cwd = new Cwd();
  
  if (!command) return feedback.error('Invalid command'); // TODO: make this show the "divshot help"
  
  callback = callback || function () {};
  command.require = command.require || [];
  
  if (command.tasks && options.task && !command.tasks[options.task]) return feedback.error('Invalid command'); // TODO: make this show the "divshot help"
  
  // User data
  if (command.require.indexOf('user') > -1) {
    options.user = user;
  }
    
  // Authenticate user
  if (command.require.indexOf('authenticate') > -1) {
    options.user = options.user || user;
    if (!options.user.authenticated()) return feedback.error(errors.NOT_AUTHENTICATED);
  }
  
  // App config data
  if (command.require.indexOf('config') > -1) {
    options.config = cwd.getConfig();
  }
  
  // Include current working directory class
  if (command.require.indexOf('cwd') > -1) {
    options.cwd = cwd;
  }
  
  // command/task helper methods
  options.update = function (msg, options) {
    var logger = 'info';
    
    if (options && options.success) logger = 'success';
    feedback[logger](msg);
  };
  options.done = function () {
    callback.apply(null, [].slice.call(arguments, 0));
  };
  options.error = function (msg) {
   feedback.error(msg);
   callback(msg);
  };
  options.errors = errors;
  options.api = Divshot.createClient({
    token: user.get('token'),
    host: options.host || API_HOST
  });
  options.execute = divshot; // Allows us to reach other commands and such
  
  if (options.task) command.tasks[options.task].apply(options, options.args);
  else command.register.apply(options, options.args);
};

//
createShortcuts(divshot);

//
divshot._command = function (argv) {
  return divshot._commandOptions(divshot._parseArgs(argv));
};

divshot._commandOptions = function (args) {
  var first = args.shift();
  var command = (first) ? first.split(':') : [];
  var options = {
    command: command[0],
    args: args,
  };

  if (command[1]) options.task = command[1];
  return options;
};

divshot._parseArgs = function (argv) {
  var args = argv._ || [];
  
  Object.keys(argv).forEach(function (arg) {
    if (arg === '_') return;
    args[arg] = argv[arg];
  });
  
  if (typeof args === 'string') args = [args];
  
  return args;
};

module.exports = divshot;