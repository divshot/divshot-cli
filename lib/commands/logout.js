module.exports = function (app) {
  var program = app.program;
  
  program
    .command('logout')
    .description('logout of divshot.io')
    .action(function () {
      app.config.user.logout();
      
      app.logger.writeln();
      app.logger.success('Logged out');
    });
};