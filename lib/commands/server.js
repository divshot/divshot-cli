var path = require('path');
var spawn = require('child_process').spawn;

module.exports = function (cli) {
  var command = cli.command('server <optional directory>', 's <optional directory>');
  
  command.description('start server for local development');
  command.handler(function (customDir, done) {
    var cmd = path.resolve(__dirname, '../../node_modules/.bin/superstatic');
    var server = spawn(cmd , process.argv.splice(3));
    
    server.stdout.on('data', function (data) {
      cli.log(data.toString());
    });
    
    server.stderr.on('data', function (data) {
      done(cli.errors.SERVER_ERROR);
    });
    
    server.on('close', function () {
      done();
    });
  });
};