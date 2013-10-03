var request = require('request');
var winston = require('winston');
var reqular = require('regular');
var divshot = require('../divshot');

var internals = {
  userConfig: divshot.config.stores.user,
  
  schema: {
    properties: {
      email: {
        pattern: reqular.email,
        required: true
      },
      password: {
        hidden: true,
      }
    }
  },
  
  parseTokenFromHeaders: function (headers) {
    var location;
    var token;
    
    if (location = headers.location) {
      token = location.split('#')[1].split('=')[1];
    }
    
    return token;
  },
  
  getToken: function (email, password, callback) {
    request({
      method: 'POST',
      url: 'http://api.dev.divshot.com:9393/auth/identity/callback',
      followRedirect: false,
      form: {
        auth_key: email,
        password: password
      }
    }, function (err, r, body) {
      callback(err, internals.parseTokenFromHeaders(r.headers));
    });
  },
  
  saveToken: function (token, callback) {
    internals.userConfig.set('token', token);
    internals.userConfig.save(callback);
  },
  
  initLogin: function (callback) {
    return function (err, userInput) {
      if (err) {
        return winston.error(err.message.red);
      }
      
      internals.getToken(userInput.email, userInput.password, function (err, token) {
        if (err) {
          return winston.error('Invalid email or password'.red);
        }
        
        internals.saveToken(token, callback);
      });
    };
  }
  
};

module.exports = function (callback) {
  divshot.prompt.get(internals.schema, internals.initLogin(function () {
    winston.info('Authentication Successful'.green);
    callback();
  }));
};

module.exports.internals = internals;
module.exports.usage = ['Login to the Divshot api'];