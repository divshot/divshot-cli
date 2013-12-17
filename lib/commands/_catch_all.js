module.exports = function (app) {
  app.program
    .command('*')
    .description('cool graphics, bro')
    .action(function () {
      if (arguments.length === 1) {
        
        // show divshot graphic
        
        return;
      }
      
      var command = app._.initial(arguments).join(' ');
      app.logger.writeln();
      app.logger.info('\'' + command + '\' is not a ' + app.format.blue('Divshot.io') + ' command.');
      app.logger.info('Please use ' + app.format.bold('"divshot help"') + ' for a list of ' + app.format.blue('Divshot.io') + ' commands.');
    });
};