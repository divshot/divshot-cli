var path = require('path');
var spawn = require('child_process').spawn;
var superstatic = require('superstatic');

exports.require = ['config'];

exports.description = 'start server for local development';

exports.register = function (customDir) {
  var command = this;
  var childProcessArgs = [];
  var port = command.args.p || command.args.port;
  var host = command.args.host;
  
  if (customDir && typeof customDir !== 'object') childProcessArgs.unshift(customDir);
  if (port) childProcessArgs = childProcessArgs.concat('-p', port);
  if (host) childProcessArgs = childProcessArgs.concat('-h', host);
  if (host) childProcessArgs = childProcessArgs.concat('--logging');
  
  command.update('Starting server ...');
  
  var cmd = path.resolve(__dirname, '../../../node_modules/.bin/superstatic');
  var server = spawn(cmd , childProcessArgs);
  
  server.stdout.on('data', function (data) {
    command.update(data.toString());
  });
  
  server.stderr.on('data', function (data) {
    command.error(data.toString());
  });
  
  server.on('close', function () {
    command.done();
  });
};