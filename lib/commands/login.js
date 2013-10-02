var request = require('request');
var winston = require('winston');
var divshot = require('../divshot');

var internals = {
  
};

function login (callback) {
  divshot.prompt.get(login.schema, function (err, result) {
    if (err) {
      return console.log(err.message.red);
    }
    
    var user = divshot.config.stores.user;
    
    request({
      method: 'POST',
      url: 'http://api.dev.divshot.com:9393/auth/identity/callback',
      followRedirect: false,
      form: {
        auth_key: result.email,
        password: result.password
      }
    }, function (err, r, body) {
      var location;
      var token;
      
      if (location = r.headers.location) {
        token = location.split('#')[1].split('=')[1];
        user.set('token', token);
        user.save();
      }
      else{
        winston.error('Invalid email or password'.red);
      }
      
      callback();
    });
  });
}

login.schema = {
  properties: {
    email: {
      pattern: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: 'Email must be valid',
      required: true
    },
    password: {
      hidden: true,
    }
  }
};

module.exports = login;
module.exports.internals = internals;
module.exports.usage = ['Login to the Divshot api'];