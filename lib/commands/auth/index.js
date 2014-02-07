module.exports = function (cli) {
  var command = cli.command('auth');
  command.description('authentication help');
  
  var tokenTask = command.task('token');
  tokenTask.description('show your authentication token');
  tokenTask.action(function (done) {
    var token = cli.user.get('token');
    cli.log(token);
    done(null, token);    
  });
};