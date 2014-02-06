var path = require('path');
var format = require('chalk');
var feedback = require('feedback');
var homeDir = require('home-dir');
var commands = require('./commands');
var errors = require('./errors');
var User = require('./user');
var Cwd = require('./cwd');
var Divshot = require('divshot');

var cliConfigDirectory = path.join(homeDir(), '.divshot');
var API_HOST = 'https://api.divshot.com';

function divshot (options, callback) {
  var command = commands[options.command];
  
  if (!command) return feedback.error('Invalid command'); // TODO: make this show the "divshot help"
  
  if (command.authenticate) {
    options.user = new User(cliConfigDirectory);
    if (!options.user.authenticated()) return feedback.error(errors.NOT_AUTHENTICATED);
  }
  
  if (command.config) {
    var cwd = new Cwd();
    options.config = cwd.getConfig();
  }
  
  options.update = function (msg, options) {
    var logger = 'info';
    if (options && options.success) logger = 'success';
    feedback[logger](msg);
  };
  options.done = function () {
    callback.apply(null, [].slice.call(arguments, 0));
  };
  options.error = feedback.error.bind(feedback);
  options.errors = errors;
  options.api = Divshot.createClient({
    token: options.user.get('token'),
    host: options.host || API_HOST
  });
  
  command.register(options);
};


// Create helper methods
Object.keys(commands).forEach(function (command) {
  divshot[command] = function () {
    var args;
    var options;
    var callback;
    
    if (arguments.length === 1) callback = arguments[0];
    if (arguments.length === 2) {
      
    }
      
    console.log('apps');
    }
  };
});


divshot._command = function (argv) {
  return divshot._commandOptions(divshot._parseArgs(argv));
};

divshot._commandOptions = function (args) {
  var command = args.shift().split(':');
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
  
  return args;
};

module.exports = divshot;