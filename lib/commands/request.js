var _ = require('lodash');
var format = require('chalk');
var print = require('pretty-print');
var request = require('request');
var join = require('join-path');

var HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch'];

module.exports = function (cli) {
  
  var command = cli.command('request')
    .secret(true)
    .handler(function () {
      
      cli.log();
      cli.log('Please use ' + format.bgYellow.black(' divshot request:<http method> <url> <body> ') + ' if you want to make a request.');
      cli.log();
      cli.log('Available http methods:');
      cli.log();
      print(HTTP_METHODS, {
        leftPadding: 2
      });
    });
  
  HTTP_METHODS.forEach(function (method) {
    
    command.task(method).handler(methodHandler);
    
    function methodHandler (url, body, done) {
            
      // Ensure callback and body values
      if (typeof body === 'function') {
        done = body;
        body = undefined;
      }
      
      request[method.toLowerCase()]({
        url: join(cli.api.options.host, url),
        headers: {
          Authorization: 'Bearer ' + cli.user.get('token')
        },
        body: body
      }, function (err, response, body) {
        
        if (err) {
          return done(err);
        }
        
        // Convert to object so we can format
        if (_.isString(body)) {
          body = JSON.parse(body);
        }
        
        // Format
        if (_.isObject(body)) {
          body = JSON.stringify(body, null, 2);
        }
        
        cli.log();
        cli.log(body);
        cli.log();
      });
    }
  });
};