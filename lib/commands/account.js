var format = require('chalk');
var moment = require('moment');
var request = require('request');

module.exports = function (cli) {
  var account = cli.command('account')
    .description('display basic account details')
    .before('authenticate')
    .handler(account);
  
  account.task('redeem <voucher code>')
    .description('reedem a voucher and credit it to your account')
    .handler(redeem);
  
  function account (done) {
    cli.api.user.self(function (err, response, user) {
      if (err) return done(cli.errors.DEFAULT);
      
      var balance = (user.account.balance/100 < 0) ? 0 : user.account.balance;
      
      cli.log()
      cli.log('Account Balance: $' + balance);
      
      // Account credit
      if (user.account.credit > 0) cli.log('Account Credit: $' + user.account.credit/100);
      
      cli.log('Account Created: ' + moment(user.created_at).format('MMMM Do, YYYY')); // TODO: format this
      
      // Emails
      if (user.emails.length) cli.log('Emails: ');
      user.emails.forEach(function (email) {
        var address = email.address;
        
        if (!email.confirmed) address += format.bold(' (unconfirmed)');
        if (email.primary) address += format.bold(' (primary)');
        
        cli.log('  ' + address);
      });
      
      // Organizations
      if (user.organizations.length > 0) {
        cli.log('Organizations: ');
      }
      
      done(null, user);
    });
  }
  
  function redeem (code, done) {
    if (!code) return done(cli.errors.INVALID_VOUCHER);
    
    cli.api.vouchers.redeem(code, function (err, response, body) {
      if (err) return done(cli.errors.DEFAULT);
      if (response.statusCode == 304) return done(cli.errors.VOUCHER_USED_BY_YOU);
      if (response.statusCode == 404) return done(cli.errors.INVALID_VOUCHER);
      if (response.statusCode == 403) return done(cli.errors.VOUCHER_USED);
      
      cli.log();
      cli.log(format.bold('$' + body.amount/100) + ' has been applied to your account.', {success:true});
    });
  }
  
};