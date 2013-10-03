var fs = require('fs');
var divshot = require('../divshot');
var winston = require('winston');

module.exports = function (callback) {
  var user = divshot.config.stores.user;
  
  user.set('token');
  user.save(function (err) {
    winston.info('You have been logged out'.green);
    callback();
  });
};

module.exports.usage = ['Logout of Divshot'];