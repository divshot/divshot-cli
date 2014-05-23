var _ = require('lodash');
var regular = require('regular');
var formatUserEmails = require('../helpers/format_user_emails');

module.exports = function (cli) {
  var emails = cli.command('emails')
    .description('show all emails associated with your account')
    .before('authenticate')
    .handler(showUserEmails);
  
  emails.task('add <email>')
    .description('add an email to your account')
    .handler(addEmail);
  
  emails.task('remove <email>')
    .description('remove an email from your account')
    .handler(removeEmail);
  
  emails.task('resend <email>')
    .description('resend the confirmation for an email')
    .handler(resend);
  
  function showUserEmails (done) {
    cli.api.user.self(function (err, response, user) {
      if (err) return done(cli.errors.DEFAULT);
      
      cli.log();
      cli.logObject(formatUserEmails(user.emails), {
        leftPadding: 2
      });
      
      done(null, user.emails);
    });
  }
  
  function addEmail (email, done) {
    if (!email) return done(cli.errors.MISSING_EMAIL);
    if (!regular.email.test(email)) return done(cli.errors.INVALID_EMAIL);
    
    cli.api.user.emails.add(email, function (err, response, body) {
      if (err || response.statusCode >= 300) return done(cli.errors.DEFAULT);
      
      cli.log();
      cli.log(email + ' has been added to your account', {success: true});
      
      done(null, body);
    });
  }
  
  function removeEmail (email, done) {
    if (!email) return done(cli.errors.MISSING_EMAIL);
    
    cli.api.user.emails.remove(email, function (err, response, body) {
      if (err || response.statusCode >= 300) return done(cli.errors.DEFAULT);
      
      cli.log();
      cli.log(email + ' has been removed from your account', {success: true});
      
      done(null, body);
    });
  }
  
  function resend(email, done) {
    if (!email) return done(cli.errors.MISSING_EMAIL);
    
    cli.api.user.emails.resend(email, function (err, response, body) {
      if (err || response.statusCode >= 300) return done(cli.errors.DEFAULT);
      
      cli.log();
      cli.log('A confirmation email has been resent to ' + email, {success: true});
      done(null, body);
    });
  }
};