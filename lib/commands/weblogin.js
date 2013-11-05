var promptly = require('promptly');
var request = require('request');
var url = require('url');

module.exports = function (app) {
  var program = app.program;
  var host = app.api._api.host;
  
  program
    .command('weblogin')
    .description('login to ' + 'Divshot.io'.blue + ' with the web.')
    .example('weblogin')
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
          app.config.user.set('token', JSON.parse(body));
        }
        else if (data.error) {
          app.logger.info(response.statusCode.red.bold + ' ' + response.message);
        }
      })
    });
  }
};
