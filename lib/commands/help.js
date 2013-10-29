module.exports = function (app) {
  app.program
    .on('--help', help)
    .on('-h', help)
    .command('help')
    .action(help);
    
  function help () {
    app.logger.writeln();
    app.logger.info('Divshot.io'.blue + ' commands:');
    app.logger.writeln();
    
    app._.each(app.program.commands, function (command) {
      var name = command._name;
      var description = command._description || '';
      var spaceNum = 12 - name.length;
      
      if (name === '*' || name === 'help') return;
      
      // Name
      app.logger.write('  ' + command._name.bold);
      
      while (spaceNum--) {
        app.logger.write(' ');
      }
      
      // Description
      app.logger.write(' - ' + description);
      app.logger.writeln();
    });
  }
};