module.exports = function (cli) {
  var command = cli.command('logout');
  
  command.description('logout from Divshot');
  command.handler(function (done) {
    cli.user.logout();
    cli.log('Logged out', {success: true});
    done();
  });
};
