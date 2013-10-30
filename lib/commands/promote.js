module.exports = function (app) {
  app.program
    .command('promote [from] [to]')
    .description('promote one environment to another')
    .example('promote [from] [to]')
    .action(function (from, to) {
      var config = app.cwd.getConfig();
      
      app.api.apps.id(config.name).releases.env(to).promote(from, function (err, response) {
        console.log(JSON.parse(response.body));
      });
    });
};