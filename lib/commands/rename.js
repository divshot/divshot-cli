module.exports = function (app) {
  app.program
    .command('rename [name]')
    .description('change the name of an app')
    .example('rename [name]')
    .withConfig()
    .withAuth()
    .handler(function (name) {
      console.log(name);
    });
};