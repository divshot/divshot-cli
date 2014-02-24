module.exports = function (cli) {
  cli.command('auth')
    .description('authentication help')
    .task('token')
      .description('show your authentication token')
      .handler(function (done) {
        var token = cli.user.get('token');
        cli.log(token);
        done(null, token);    
      });
};