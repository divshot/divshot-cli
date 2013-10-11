var cli = require('../divshot');
var _find = require('lodash.find');
var internals = {};

var destroy = module.exports = function (appName, callback) {
  
  cli.prompt.get({
    name: 'yesno',
    message: 'Are you sure you want to permanantly delete this app? (y/n)',
    validator: /y[es]*|n[o]?/,
    warning: 'Must respond yes or no',
    default: 'no'
  }, function (err, result) {
    if (result.yesno === 'yes' || result.yesno === 'y') {
      cli.api.apps.list(function (err, apps) {
        var appObj = _find(apps, function (app) {
          return app.name === appName;
        });
        
        var app = cli.api.apps.one(appObj.id);
        
        app.remove(function (err) {
          console.log('\n' + appName + ' has been permanantly deleted.');
        });
      }); 
    }
  });
  

};

destroy.internals = internals;
destroy.usage = ['Delete a Divshot.io app'];
