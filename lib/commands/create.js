var divshot = require('../divshot');
var path = require('path');
var request = require('request');

module.exports = function (appName, callback) {
  // request.post(divshot.config.get('API_HOST'), '/apps', {
  //   name: appName
  // }).pipe(process.stdout);
  
  // console.log('Provisioning ' + appName + '...', 'done'.green);
  // console.log('Application Url:', 'http://'.yellow + appName.yellow + '.divshot.io/'.yellow);
};

module.exports.usage = ['Create a Divshot.io app'];
