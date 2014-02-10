var path = require('path');
var feedback = require('feedback');
var homeDir = require('home-dir');
var commands = require('./commands');
var User = require('./user');
var Cwd = require('./cwd');
var print = require('pretty-print');
var _ = require('lodash');
var cliConfigDirectory = path.join(homeDir(), '.divshot');
var Cli = require('./cli');
var drainer = require('drainer');

function divshot (options, callback) {
  callback = callback || function () {};
  
  var cli = loadCli(options, callback);
  var command = cli.getCommand(options.command);
  var flags = [];
  
  cli.generateShortcuts();
  
  
  // Set default app flags
  var helpFlag = cli.flag('-h', '--help');
  helpFlag.description('display Divshot Cli help and options');
  helpFlag.exit(true);
  helpFlag.action(function () {
    cli.commands.help({debug: true});
  });
  
  var appFlag = cli.flag('-u', '--user');
  appFlag.description('override the directory\'s app name');
  appFlag.action(function (appName) {});
  
  var tokenFlag = cli.flag('-t', '--token');
  tokenFlag.description('override your current user authentication token');
  tokenFlag.action(function (token) {});
  
  // Execute flags
  try{
    var exit = false;
    var flags = Object.keys(options.args);
    
    flags.forEach(function (flagName) {
      var flag = cli._flags[flagName];
      flag.execute(options.args[flagName]);
      if (flag._exit) exit = true;
    });
  }
  catch (e) {}
  if (exit) return;
  
  
  if (!command) return feedback.error('Invalid command'); // TODO: make this show the "divshot help"  
  
  // Execute task
  if (options.task) {
    
    // TODO: handle beforeCommands with tasks to
    
    if (!command.isTask(options.task)) return feedback.error('Invalid command');
    command.executeTask(options.task, options.args, function (err) {
      callback.apply(null, _.toArray(arguments));
      
      if (err) return cli.error(err);
    });
  }
  
  // Execute action
  else {
    // Handle before functions
    var drain = drainer(_.map(command._before, cli.beforeCommand, cli));
    
    drain(cli, command, function (err) {
      if (err) return cli.error(err);
      
      command.execute(options.args, function (err) {
        callback.apply(null, _.toArray(arguments));
        
        if (err) cli.error(err);
      });
    });
  }
};

function loadCli (options, callback) {
  options = options || {};
  
  var user = new User(cliConfigDirectory);
  var cwd = new Cwd();
  var cli = new Cli(_.extend({
    user: user,
    cwd: cwd, 
    callback: callback
  }, options));
  
  Object.keys(commands).forEach(function (command) {
    commands[command](cli);
  });
  
  // TODO: move this somewhere. Probably don't register methods like this
  // and use a callback in the before method
  // Set up cli
  // cli.helper('authenticate', function () {
  // 
  // })
  cli.beforeCommand('authenticate', function (cli, command, done) {
    if (!cli.user.authenticated()) return done(cli.errors.NOT_AUTHENTICATED);
    done();
  });
  
  return cli;
}












// function divshot (options, callback) {
//   var command = commands[options.command];
//   var user = new User(cliConfigDirectory);
//   var cwd = new Cwd();
  
//   if (!command) return feedback.error('Invalid command'); // TODO: make this show the "divshot help"
  
//   callback = callback || function () {};
//   command.require = command.require || [];
  
//   if (command.tasks && options.task && !command.tasks[options.task]) return feedback.error('Invalid command'); // TODO: make this show the "divshot help"
  
//   // User data
//   if (command.require.indexOf('user') > -1) {
//     options.user = user;
//   }
    
//   // Authenticate user
//   if (command.require.indexOf('authenticate') > -1) {
//     options.user = options.user || user;
//     if (!options.user.authenticated()) return feedback.error(errors.NOT_AUTHENTICATED);
//   }
  
//   // App config data
//   if (command.require.indexOf('config') > -1) {
//     options.config = cwd.getConfig();
//   }
  
//   // Include current working directory class
//   if (command.require.indexOf('cwd') > -1) {
//     options.cwd = cwd;
//   }
  
//   // command/task helper methods
//   options.update = function (msg, opts) {
//     var logger = 'info';
    
//     if (opts && opts.success) logger = 'success';
//     if ((options && options.debug) || (opts && opts.debug)) feedback[logger](msg);
//   };
//   options.updateObject = function (obj, opts) {
//     if (options && options.debug) print(obj, opts);
//   };
//   options.done = function () {
//     callback.apply(null, [].slice.call(arguments, 0));
    
//     if (options.debug) process.exit(0);
//   };
//   options.error = function (msg) {
//    if (options && options.debug) feedback.error(msg);
//    callback(msg);
   
//    if (options.debug) process.exit(1);
//   };
//   options.errors = errors;
//   options.api = Divshot.createClient({
//     token: user.get('token'),
//     host: options.host || API_HOST
//   });
//   options.execute = divshot; // Allows us to reach other commands and such
//   options.environments = ['development', 'staging', 'production'];
  
  
//   if (options.task) command.tasks[options.task].apply(options, options.args);
//   else command.register.apply(options, options.args);
// };

//
// createShortcuts(divshot);

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
    debug: (args.debug !== undefined) ? args.debug : true // Allows app to print to stdout or not
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