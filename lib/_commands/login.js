var promptly = require('promptly');
var request = require('request');
var url = require('url');

module.exports = function (app) {
  var host = app.api._api.host;

  app.program
    .command('login')
    .description('login to ' + app.format.blue('Divshot.io') + ' with the web.')
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
          confirmPin(response.headers.location);
        }
        else if (data.error) {
          app.logger.error(app.format.bold.red(data.statusCode) + ' ' + data.message);
        }
      });
    });
  
  function confirmPin (tokenLocation) {
    app.logger.info('To Log-In, Visit: ' + app.format.bold.underline(tokenLocation));
    promptly.prompt('Enter PIN (you\'ll receive this upon log-in):', function (error, pin) {
      request.get(tokenLocation + '/' + pin, function (error, response, body) {
        var data = JSON.parse(body);

        if (error) {
          app.logger.error(error);
        }
        else if (+response.statusCode === 200) {
          app.user.set('token', JSON.parse(body));
          app.logger.writeln();
          app.logger.success('Authenticated');
        }
        else if (data.error) {
          app.logger.info(app.format.bold.red(response.statusCode) + ' ' + response.message);
        }
      });
    });
  }
};