var promptly = require('promptly');
var request = require('request');
var url = require('url');

module.exports = function (app) {
  var host = app.api._api.host;

  app.program
    .command('login')
    .description('login to ' + 'Divshot.io'.blue + ' with the web.')
    .example('login')
    .handler(function () {
      var requestOptions = {};
      requestOptions.url = url.parse(host + '/access_token_request');
      requestOptions.followRedirect = false;
      request.post(requestOptions, function (error, response, body) {
        var data = JSON.parse(body);
        if (error) {
          app.logger.error(error, body);
        }
        else if (response.headers.location) {
          confirmPin(response.headers.location)
        }
        else if (data.error) {
          app.logger.error(data.statusCode.red.bold + ' ' + data.message);
        }
      })
    });
  
  function confirmPin (tokenLocation) {
    app.logger.info("To Log-In, Visit: " + tokenLocation.bold.underline);
    promptly.prompt("Enter PIN (you'll receive this upon log-in):", function (error, pin) {
      requestOptions = {}
      request.get(tokenLocation + '/' + pin, function (error, response, body) {
        var data = JSON.parse(body);

        if (error) {
          app.logger.error(error);
        }
        else if (response.statusCode == 200) {
          app.user.set('token', JSON.parse(body));
          app.logger.writeln();
          app.logger.success('Authenticated');
        }
        else if (data.error) {
          app.logger.info(response.statusCode.red.bold + ' ' + response.message);
        }
      })
    });
  }
};
// Legacy username/password login might be useful?
// module.exports = function (app) {
//   var promptly = require('promptly');
//   var regular = require('regular');
//   var program = app.program;
  
//   program
//     .command('login')
//     .description('login to ' + 'Divshot.io'.blue)
//     .example('login')
//     .handler(function () {
//       app.logger.info('Enter your Divshot.io credentials');
      
//       promptly.prompt('Email: ', {
//         trim: true,
//         validator: function (email) {
//           return (regular.email.test(email)) ? email : false;
//         }
//       }, function (err, email) {
//         if (!email) return app.logger.error('Invalid email');
        
//         promptly.password('Password: ', function (err, password) {
          
//           app.api.user.setCredentials({
//             email: email,
//             password: password
//           });
          
//           app.api.user.authenticate(function (err, token) {
//             if (err) return app.logger.error(err);
            
//             app.user.set('token', token);
            
//             app.logger.writeln();
//             app.logger.success('Authenticated');
//           });
//         });
//       });
//     });
// };
