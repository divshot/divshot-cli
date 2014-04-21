var format = require('chalk');
var moment = require('moment');
var request = require('request');
var _ = require('lodash');
var formatUserEmails = require('../helpers/format_user_emails');

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
      var output = {};
      
      cli.log();
      
      output['Account Balance'] = '$' + balance;
      
      // Account credit
      if (user.account.credit > 0) output['Account Credit'] = '$' + user.account.credit/100;
      
      output['Account Created'] = moment(user.created_at).format('MMMM Do, YYYY');
      
      // Emails
      if (user.emails.length) output['Emails'] = formatUserEmails(user.emails);
      
      // Organizations
      if (user.organizations.length > 0) output['Organizations'] = _.pluck(user.organizations, 'name');
      
      // Output to stdout
      cli.logObject(output);
      
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