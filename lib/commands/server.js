var path = require('path');
var spawn = require('child_process').spawn;

module.exports = function (cli) {
  var command = cli.command('server <optional directory>');
  
  command.description('start server for local development');
  command.handler(function (customDir, done) {
    var childProcessArgs = [];
    var port = cli.args.args.p || cli.args.args.port;
    var host = cli.args.args.host;
    
    if (customDir && typeof customDir !== 'object') childProcessArgs.unshift(customDir);
    if (port) childProcessArgs = childProcessArgs.concat('-p', port);
    if (host) childProcessArgs = childProcessArgs.concat('-h', host);
    if (host) childProcessArgs = childProcessArgs.concat('--logging');
    
    cli.log('Starting server ...');
    
    var cmd = path.resolve(__dirname, '../../node_modules/.bin/superstatic');
    var server = spawn(cmd , childProcessArgs);
    
    server.stdout.on('data', function (data) {
      cli.log(data.toString());
    });
    
    server.stderr.on('data', function (data) {
      done(data.toString());
    });
    
    server.on('close', function () {
      done();
    });
  });
};