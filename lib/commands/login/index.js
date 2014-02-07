var promptly = require('promptly');
var request = require('request');
var url = require('url');
var format = require('chalk');

exports.require = ['user'];

exports.register = function () {
  var command = this;
  var host = command.api._api.host;
  var requestOptions = {};
  
  requestOptions.url = url.parse(host + '/access_token_request');
  requestOptions.followRedirect = false;
  request.post(requestOptions, function (err, response, body) {
    var data = JSON.parse(body);
    
    if (err) return command.error(command.errors.DEFAULT);
    if (data.error) command.error(format.bold.red(data.statusCode) + ' ' + data.message);
    if (response.headers.location) return confirmPin(response.headers.location);
  });
  
  function confirmPin (tokenLocation) {
    command.update('To Log-In, Visit: ' + format.bold.underline(tokenLocation));
    
    promptly.prompt('Enter PIN (you\'ll receive this upon login):', function (error, pin) {
      request.get(tokenLocation + '/' + pin, function (err, response, body) {
        var data = JSON.parse(body);

        if (err) return command.error(command.errors.DEFAULT);
        if (data.error) return command.error(format.bold.red(response.statusCode) + ' ' + response.message);
        
        if (+response.statusCode === 200) {
          command.user.set('token', JSON.parse(body));
          
          command.update();
          command.update('Authenticated!', {success:true});
          command.done(null, JSON.parse(body));
        }
      });
    });
  }
};