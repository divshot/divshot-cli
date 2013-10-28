module.exports = function (app) {
  app.program
    .on('--help', help)
    .on('-h', help)
    .command('help')
    .action(help);
    
  function help () {
    console.log('help');
  }
};