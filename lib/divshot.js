require("colors");

var path = require('path');
var Divshot = require('divshot');
var package = require('../package');
var glob = require('glob').sync;
// var argv = require('optimist').argv;
var User = require('./user');
var Cwd = require('./cwd');
var app = { config: {} };
var _ = require('lodash');
var feedback = require('feedback');

app._ = _;
app.logger = require('feedback');
app.program =  require('commander');
app.config.user = new User(divshotDir());
app.cwd = new Cwd(app);
app.api = Divshot.createClient({
  token: app.config.user.get('token'),
  host: 'https://api.divshot.com'
  // host: 'http://api.dev.divshot.com:9393'
});
app.environments = ['development', 'staging', 'production'];
app.command = function (name) {
  return _.find(app.program.commands, function (command) {
    return command._name === name;
  });
};

app.loading = function (timing) {
  var interval;
  var callback = function () {
    clearInterval(interval);
  };
  
  timing = timing || 500;
  
  interval = setInterval(function () {
    app.logger.write('.');
  }, timing);
  
  return callback;
}

// Extend Commander

app.program.Command.prototype.example = function (str) {
  if (!str) return this._example || '';
  
  this._example = str
  return this;
};

app.program.Command.prototype.trigger = function (args) {
  this.parent.emit(this._name, args);
  return this;
};

app.program.Command.prototype.handler = function (callback) {
  var self = this;
  
  this.action(function () {
    if (self._withAuth && !app.config.user.authenticated()) {
      return app.logger.error('You must be logged in to do that.');
    }
    
    if (self._withConfig) {
      self.config = app.cwd.getConfig();
      if (!self.config || !self.config.name) return app.logger.error('Current directory is not a ' + 'Divshot.io'.blue + ' app');
    }
    
    callback.apply(self, arguments);
  });
}

app.program.Command.prototype.withAuth = function () {
  this._withAuth = true;
  return this;
};

app.program.Command.prototype.withConfig = function () {
  this._withConfig = true;
  return this;
};

// Setup
app.program
  .version(package.version)
  .option('-v', 'output version number')
  .option('-p, --port [port]', 'set the port')
  .option('--host [host]', 'set the host')
  .on('-v', function () {
    app.logger.info(package.version);
  });

// Commands
require('./commands')(app);

// Catch all
app.program
  .command('*')
  .description('cool graphics, bro')
  .action(function () {
    if (arguments.length === 1) {
      
      // show divshot graphic
      
      return;
    }
    
    var command = _.initial(arguments).join(' ');
    feedback.writeln();
    feedback.info("'" + command + "' is not a " + "Divshot.io".blue + " command.");
    feedback.info("Please use " + "'divshot help'".bold + " for a list of " + "Divshot.io".blue + " commands.");
  });

app.program.parse(process.argv);


function divshotDir() {
  return path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.divshot')
}


