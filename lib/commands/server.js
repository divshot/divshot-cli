var path = require('path');
var spawn = require('child_process').spawn;

module.exports = function (cli) {
  var command = cli.command('server <optional directory>', 's <optional directory>');
  
  command.description('start server for local development');
  command.handler(function (customDir, done) {
    var cmd = path.resolve(__dirname, '../../node_modules/.bin/superstatic');

    //for(var prop in process.env){    	cli.log('process.env.'+prop+' = '+process.env[prop]);    }

    var server;

    //  On Windows, spawn has to delegate its work to cmd to avoid ENOENT error.
    if(process && process.env && process.env.OS.toLowerCase().indexOf('windows') >= 0) {
    	cli.log('[divshot-cli/lib/command/server.js] Running on Windows: spawn workaround.');
    	 server = spawn('cmd', ['/s','/c',cmd,process.argv.splice(3)], {
	      windowsVerbatimArguments: true
	    });
    }
    else {
    	server = spawn(cmd , process.argv.splice(3));
    }

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
