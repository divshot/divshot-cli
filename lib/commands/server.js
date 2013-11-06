var path = require('path');
var spawn = require('child_process').spawn;
var superstatic = require('superstatic');
var _ = require('lodash');

module.exports = function (app) {
  app.program
    .command('server')
    .description('start server for local dev')
    .example('server [cwd] [--port 8080, (optional)]')
    .withConfig()
    .handler(function (customDir) {
      var childProcessArgs = [];
      var port = app.program.p || app.program.port;
      var host = app.program.host;
      
      if (customDir && typeof customDir !== 'object') childProcessArgs.unshift(customDir);
      if (port) childProcessArgs = childProcessArgs.concat('-p', port);
      if (host) childProcessArgs = childProcessArgs.concat('-h', host);
      
      app.logger.info('Staring server ...');
      
      var cmd = path.resolve(__dirname, '../../node_modules/.bin/superstatic');
      var server = spawn(cmd , childProcessArgs);
      
      server.stdout.on('data', function (data) {
        process.stdout.write(data.toString());
      });
      
      server.stderr.on('data', function (data) {
        process.stderr.write(data.toString().red);
      });
    });
};