var path = require('path');
var spawn = require('child_process').spawn;
var superstatic = require('superstatic');

module.exports = function (app) {
  app.program
    .command('server')
    .description('start server for local dev')
    .action(function () {
      app.logger.info('Staring server ...');
      
      var cmd = path.resolve(__dirname, '../../node_modules/.bin/superstatic');
      var server = spawn(cmd);
      
      server.stdout.on('data', function (data) {
        process.stdout.write(data.toString());
      });
      server.stderr.on('data', function (data) {
        process.stderr.write(data.toString());
      });
    });
};