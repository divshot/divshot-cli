var cli = require('../divshot');
var winston = require('winston');

var internals = {};

var apps = module.exports = function (callback) {
  cli.api.apps.list(function (err, apps) {
    var msg = '\n';
    
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
