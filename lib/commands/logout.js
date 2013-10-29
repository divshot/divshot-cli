module.exports = function (app) {
  var program = app.program;
  
  program
    .command('logout')
    .description('logout from ' + 'Divshot.io'.blue)
    .example('logout')
    .action(function () {
      app.config.user.logout();
      
      app.logger.writeln();
      app.logger.success('Logged out');
    });
};