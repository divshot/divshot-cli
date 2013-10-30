module.exports = function (app) {
  app.program
    .command('domains')
    .description('list your domains')
    .example('domains')
    .action(function () {
      
    });
};