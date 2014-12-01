var regular = require('regular');

exports.register = function (imports) {
  
  var api = imports.api;
  var errors = imports.errors;
  
  var _resource = {
    all: api.get('self', 'emails'),
    add: api.post('self', 'emails')
  };
  
  var emails = function (done) {
    
    _resource.all()
      .then(function (response) {
        done(null, response.body, response);
      })
      .catch(function (response) {
        done(null, response.body, response);
      });
  };
  
  emails._resource = _resource;
  
  emails.add = function (email, done) {
    
    done = done || function () {};
    
    if (!email) {
      return done(new Error(errors.MISSING_EMAIL));
    }
    
    if (!regular.email.test(email)) {
      return done(new Error(errors.INVALID_EMAIL));
    }
    
    _resource.add({address: email})
      .then(function (response) {
        done(null, response.body, response);
      })
      .catch(function (response) {
        done(null, response.body, response);
      });
  };
  
  emails.remove = function (email, done) {
    
    done = done || function () {};
    
    if (!email) {
      return done(new Error(errors.MISSING_EMAIL));
    }
    
    api.delete('self', 'emails', email)()
      .then(function (response) {
        done(null, response.body, response);
      })
      .catch(function (response) {
        done(null, response.body, response);
      });
  };
  
  
  return emails;
};

exports.attributes = {
  name: 'emails'
};







/*
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
 */



/*
var emails = api.endpoint('self/emails', {
  add: function (email, callback) {
    return this.http.request(this.url(), 'POST', {
      form: {
        address: email
      }
    }, callback);
  },

  primary: function (email, callback) {
    return this.http.request(this.url(), 'POST', {
      form: {
        address: email,
        primary: true
      }
    }, callback);
  },

  remove: function (email, callback) {
    return emails.one(email).remove(callback);
  },

  resend: function (email, callback) {
    var email =  emails.one(email);
    var url = email.url() + '/resend';

    return this.http.request(url, 'POST', callback);
  }
});
 */