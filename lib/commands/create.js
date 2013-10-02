module.exports = function (appName, callback) {
  console.log('Provisioning ' + appName + '...', 'done'.green);
  console.log('Application Url:', 'http://'.yellow + appName.yellow + '.divshot.io/'.yellow);
};

module.exports.usage = ['Create a Divshot.io app'];
