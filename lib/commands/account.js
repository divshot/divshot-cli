var format = require('chalk');
var moment = require('moment');

module.exports = function (cli) {
  var account = cli.command('account')
    .description('display basic account details')
    .before('authenticate')
    .handler(function (done) {
      cli.api.user.self(function (err, response, user) {
        if (err) return done(cli.errors.DEFAULT);
        
        cli.log()
        cli.log('Account Balance: $' + user.account.balance);
        
        if (user.account.credit > 0) cli.log('Account Credit: $' + user.account.credit);
        
        cli.log('Account Created: ' + moment(user.created_at).format('MMMM Do, YYYY')); // TODO: format this
        
        if (user.emails.length) cli.log('Emails: ');
        user.emails.forEach(function (email) {
          var address = email.address;
          
          if (!email.confirmed) address += format.bold(' (unconfirmed)');
          if (email.primary) address += format.bold(' (primary)');
          
          cli.log('  ' + address);
        });
        
        if (user.organizations.length > 0) {
          cli.log('Organizations: ');
        }
        
        done(null, user);
      });
    });
  
  
};