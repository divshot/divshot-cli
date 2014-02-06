module.exports = function (app) {
  var program = app.program;
  
  program
    .command('logout')
    .description('logout from ' + app.format.blue('Divshot.io'))
    .example('logout')
    .handler(function () {
      app.user.logout();
      
      app.logger.writeln();
      app.logger.success('Logged out');
    });
};