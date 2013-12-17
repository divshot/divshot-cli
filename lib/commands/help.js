var print = require('pretty-print');

module.exports = function (app) {
  app.program
    .on('--help', help)
    .on('-h', help)
    .command('help [command]')
    .description('get help with common ' + app.format.blue('Divshot.io') + ' commands')
    .example('help [command (optional)]')
    .handler(help);
    
  function help (commandName) {
    if (!commandName) return globalHelp(app);
    commandHelp(app, commandName);
  }
};

function globalHelp (app) {
  app.logger.writeln();
  app.logger.info(app.format.blue('Divshot.io') + ' commands:');
  app.logger.writeln();
  
  var commands = app._.filter(app.program.commands, function (command) {
    return command._name !== '*';
  });
  
  print(commands, {
    padding: 3,
    key: '_name',
    value: '_description'
  });
}

function commandHelp (app, commandName) {
  var command = app.command(commandName);
  
  if (!command) return app.command('*').trigger([commandName]);
  
  // TODO: figure out why it seems like some parts
  // of the app are executing when running this help command
  console.error = function () {};
  
  app.logger.writeln();
  app.logger.info(command.description());
  
  if (command._example) {
    app.logger.writeln();
    app.logger.info('  example: ' + app.format.bold('divshot ') + app.format.bold(command.example()));
  }
}