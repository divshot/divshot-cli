module.exports = function (cli) {
  var command = cli.command('logout');
  
  command.description('logout form Divshot');
  command.handler(function (done) {
    cli.user.logout();
    cli.log('Logged out', {success: true});
    done();
  });
};