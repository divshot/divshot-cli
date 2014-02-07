var print = require('pretty-print');
var format = require('chalk');

module.exports = function (write) {
  return function () {
    write('');
    write(format.yellow('Global Options:'));
    write('');
    
    print({
      '-t, --token': 'manually supply your user authentication token',
      '-a, --app': 'manually supply the name of the app'
    }, {
      leftPadding: 4,
      rightPadding: 4
    });
  };
};