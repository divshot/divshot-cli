module.exports = function (app) {
  var program = app.program;
  
  program
    .command('logout')
    .description('logout from ' + 'Divshot.io'.blue)
    .example('logout')
    .handler(function () {
      app.user.logout();
      
      app.logger.writeln();
      app.logger.success('Logged out');
    });
};