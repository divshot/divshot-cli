var prettyPrint = require('./helpers/pretty_print');

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
    
    prettyPrint.array(app, app.program.commands, '_name', '_description');
  }
};