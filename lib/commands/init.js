module.exports = function (app) {
  app.program
    .command('init')
    .description('inititiate an app in the current directory')
    .action(function () {
      console.log('init');
    });
};