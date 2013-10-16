var reqular = require('regular');
var cli = require('../divshot');
var Divshot = require('divshot');
var logger = require('../logger');

var internals = {
  userConfig: cli.config.stores.user,
  
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
  
  saveToken: function (token, callback) {
    internals.userConfig.set('token', token);
    internals.userConfig.save(function (err) {
      if (err) {
        return logger.error(err.message);
      }
      
      callback();
    });
  },
  
  initLogin: function (callback) {
    return function (err, userInput) {
      if (err) {
        return logger.error(err.message);
      }
      
      cli.api.user.setCredentials({
        email: userInput.email,
        password: userInput.password
      });
      
      cli.api.user.authenticate(function (err, token) {
        if (err) {
          return logger.error('Invalid email or password');
        }
        
        internals.saveToken(token, callback);
      });
    };
  }
  
};

var login = module.exports = function (callback) {
  cli.prompt.get(internals.schema, internals.initLogin(function () {
    logger.writeln();
    logger.success('Authentication Successful');
    callback();
  }));
};

login.internals = internals;
login.usage = ['Login to the Divshot api'];