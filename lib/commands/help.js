var prettyPrint = require('pretty-print');

module.exports = function (app) {
  app.program
    .on('--help', help)
    .on('-h', help)
    .command('help [command]')
    .action(help);
    
  function help (commandName) {
    if (!commandName) return globalHelp(app);
    commandHelp(app, commandName);
  }
};

function globalHelp (app) {
  app.logger.writeln();
  app.logger.info('Divshot.io'.blue + ' commands:');
  app.logger.writeln();
  
  prettyPrint.array(app.program.commands, '_name', '_description', 3);
}

function commandHelp (app, commandName) {
  var command = app.command(commandName);
  
  app.logger.writeln();
  app.logger.info(command.description());
  
  if (command._example) {
    app.logger.writeln();
    app.logger.info('  ' + command.example().bold);
  }
}