var path = require('path');
var spawn = require('child_process').spawn;
var superstatic = require('superstatic');
var _ = require('lodash');

module.exports = function (app) {
  app.program
    .command('server')
    .description('start server for local dev')
    .action(function (customDir) {
      var childProcessArgs = [];
      var port = app.argv.p || app.argv.port;
      var host = app.argv.h || app.argv.host;
      
      // TODO: allow custom directory flag
      
      if (port) childProcessArgs = childProcessArgs.concat('-p', port);
      if (host) childProcessArgs = childProcessArgs.concat('-h', host);
      
      app.logger.info('Staring server ...');
      
      var cmd = path.resolve(__dirname, '../../node_modules/.bin/superstatic');
      var server = spawn(cmd , childProcessArgs);
      
      server.stdout.on('data', function (data) {
        process.stdout.write(data.toString());
      });
      
      server.stderr.on('data', function (data) {
        process.stderr.write(data.toString());
      });
    });
};