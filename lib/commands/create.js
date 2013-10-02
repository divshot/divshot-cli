var app = require('../divshot');
var env = app.config.get('env');
var path = require('path');
var request = require('request');

module.exports = function (appName, callback) {
  // request.post(env.API_HOST, '/apps', {
  //   name: appName
  // }).pipe(process.stdout);
  
  // console.log('Provisioning ' + appName + '...', 'done'.green);
  // console.log('Application Url:', 'http://'.yellow + appName.yellow + '.divshot.io/'.yellow);
};

module.exports.usage = ['Create a Divshot.io app'];
