var promptly = require('promptly');
var request = require('request');
var url = require('url');
var format = require('chalk');
var open = require('open');
var read = require('read');

module.exports = function (cli) {
  var POLL_TIMEOUT = 5000; // Poll api every 5 sedonds
  var command = cli.command('login');

  command.description('login to Divshot from the web');
  command.handler(function (done) {
    var host = cli.api.options.host;
    var requestOptions = {};
    var attempts = 0;
    
    cli.api.user.generateTicket().then(function (res) {
      if (!res.authorize_url) return done(cli.errors.DEFAULT);
      
      open(res.authorize_url);
      
      cli.log('Login here if browser doesn\'t open: ' + format.bold(res.authorize_url));
      
      read({silent: true, prompt: ''}, cli.log.bind(cli));
      
      process.stdout.write('\nWaiting for authorization ...');
      
      setTimeout(function () {
        checkAuthStatus(res.ticket);
      }, 3000); // check quick on the initial try
      
      function checkAuthStatus (ticket) {
        process.stdout.write('.');
        
        cli.api.user.checkTicketStatus(ticket, function (err, res, body) {
          if (res.statusCode == 200) {
            var email = (body && body.user) ? body.user.email : 'a Divshot user';
            
            cli.user.set('token', body.access_token);
            
            cli.log('\n');
            cli.log('You have successfully authenticated as ' + format.bold(email), {success:true});
            cli.log();
            
            cli.log('For more information about how to use the command-line interface, try divshot help or visit ' + format.bold('http://docs.divshot.com/guides/getting-started'));
            
            done(null, body);
            process.exit(0);
            return;
          }
          
          if (res.statusCode == 404) done(cli.errors.INVALID_TICKET);
          if (res.statusCode == 202) return setTimeout(function () { checkAuthStatus(ticket); }, POLL_TIMEOUT);
          if (res.statusCode == 410) done(cli.errors.UNABLE_TO_AUTHENTICATE_TICKET);
          
          process.exit(1);
        });
      }
    });
  });
};
