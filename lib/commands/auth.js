module.exports = function(app) {
  app.program
    .command('auth:token')
    .description('print out your access token')
    .example('auth:token')
    .action(function() {
      app.logger.info(app.config.user.get('token'));
    });
}