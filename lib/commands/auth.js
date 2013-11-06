module.exports = function(app) {
  app.program
    .command('auth:token')
    .description('print out your access token')
    .example('auth:token')
    .handler(function() {
      app.logger.info(app.user.get('token'));
    });
};