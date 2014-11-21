var _ = require('lodash');
var nash = require('nash');
var homeDir = require('home-dir');

var config = require('./config');
var user = require('./user');

module.exports = function divshot (spec) {
  
  var members = {
    local: {
      config: config,
      user: user
    }
  };
  
  return Object.freeze(members);
};