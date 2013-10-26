module.exports = function (app) {
  var promptly = require('promptly');
  var regular = require('regular');
  var program = app.program;
  
  program
    .command('login')
    .description('login to divshot.io')
    .action(function () {
      app.logger.info('Enter your Divshot.io credentials');
      
      promptly.prompt('Email: ', {
        trim: true,
        validator: function (email) {
          return (regular.email.test(email)) ? email : false;
        }
      }, function (err, email) {
        if (!email) return app.logger.error('Invalid email');
        
        promptly.password('Password: ', function (err, password) {
          
          app.api.user.setCredentials({
            email: email,
            password: password
          });
          
          app.api.user.authenticate(function (err, token) {
            if (err) return app.logger.error(err);
            
            app.config.user.set('token', token);
            
            app.logger.writeln();
            app.logger.success('Authenticated');
          });
        });
      });
    });
};
