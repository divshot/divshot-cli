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
      app.logger.info("'" + command + "' is not a " + "Divshot.io".blue + " command.");
      app.logger.info("Please use " + "'divshot help'".bold + " for a list of " + "Divshot.io".blue + " commands.");
    });
};