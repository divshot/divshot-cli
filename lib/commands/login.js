var promptly = require('promptly');
var request = require('request');
var url = require('url');
var format = require('chalk');
var openWithFallback = require('../helpers/open_with_fallback');
var read = require('read');

var POLL_TIMEOUT = 5000; // Poll api every 5 sedonds
var INITIAL_POLL_TIMEOUT = 3000;
var fallbackMessage = 'Please open this URL in your favorite browser to continue authentication:';

module.exports = function (cli) {
  var command = cli.command('login');

  command.description('login to Divshot from the web');
  command.handler(function (done) {
    var host = cli.api.options.host;
    
    cli.api.user.generateTicket().then(function (res) {
      
      if (!res.authorize_url) {
        return done(cli.errors.AUTH_TICKET_ERROR);
      }
      
      cli.log();
      cli.log(format.yellow('=== Logging into Divshot ==='));
      
      openWithFallback(res.authorize_url, fallbackMessage + '\n' + res.authorize_url, function (code) {
        read({silent: true, prompt: ''}, cli.log.bind(cli));
        
        process.stdout.write('\nWaiting for authorization ...');
        
        setTimeout(function () { checkAuthStatus(res.ticket); }, INITIAL_POLL_TIMEOUT);
      });
    }, cli.log.bind(cli));
    
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
};
