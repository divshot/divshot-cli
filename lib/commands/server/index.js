var path = require('path');
var spawn = require('child_process').spawn;
var superstatic = require('superstatic');

module.exports = function (cli) {
  var command = cli.command('server');
  
  command.description('start server for local development');
  command.action(function () {
    var customDir = arguments[0];
    var done = arguments[1]
    
    if (arguments.length < 2) {
      customDir = undefined;
      done = arguments[0];
    }
    
    var childProcessArgs = [];
    var port = cli.args.p || cli.args.port;
    var host = cli.args.host;
    
    if (customDir && typeof customDir !== 'object') childProcessArgs.unshift(customDir);
    if (port) childProcessArgs = childProcessArgs.concat('-p', port);
    if (host) childProcessArgs = childProcessArgs.concat('-h', host);
    if (host) childProcessArgs = childProcessArgs.concat('--logging');
    
    cli.log('Starting server ...');
    
    var cmd = path.resolve(__dirname, '../../../node_modules/.bin/superstatic');
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