var fs = require('fs');
var divshot = require('../divshot');
var logger = require('../logger');

module.exports = function (callback) {
  var user = divshot.config.stores.user;
  
  user.set('token');
  user.save(function (err) {
    logger.success('\nYou have been logged out');
    callback();
  });
};

module.exports.usage = ['Logout of Divshot'];