var cli = require('../divshot');
var logger = require('../logger');

var internals = {};

var apps = module.exports = function (callback) {
  cli.api.apps.list(function (err, apps) {
    var msg = '\n';
    
    if (apps.error === 'invalid_token') {
      return logger.error('You need to log in before you can do this');
    }
    
    if (!apps.length) {
      msg += "You haven't created any apps yet.".blue;
    }
    else{
      msg += '=== Your Apps\n'.blue;
      apps.forEach(function (app) {
        console.log(app.id);
        msg += app.name + '\n';
      });
    }
    
    console.log(msg);
  });
};

apps.internals = internals;
apps.usage = 'List your apps';
