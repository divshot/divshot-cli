module.exports = function (app) {
  var program = app.program;
  var logger = require('../logger');
  
  program
    .command('logout')
    .description('logout of divshot.io')
    .action(function () {
      app.config.user.logout();
      
      logger.writeln();
      logger.success('Logged out');
    });
};