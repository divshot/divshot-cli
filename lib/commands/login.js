module.exports = function (app) {
  var promptly = require('promptly');
  var regular = require('regular');
  var program = app.program;
  var logger = require('../logger');
  
  program
    .command('login')
    .description('login to divshot.io')
    .action(function () {
      logger.info('Enter your Divshot.io credentials');
      
      promptly.prompt('Email: ', {
        trim: true,
        validator: function (email) {
          return (regular.email.test(email)) ? email : false;
        }
      }, function (err, email) {
        if (!email) return logger.error('Invalid email');
        
        promptly.password('Password: ', function (err, password) {
          
          app.api.user.setCredentials({
            email: email,
            password: password
          });
          
          app.api.user.authenticate(function (err, token) {
            if (err) return logger.error(err);
            
            app.config.user.set('token', token);
            
            logger.writeln();
            logger.success('Authenticated');
          });
        });
      });
    });
};
