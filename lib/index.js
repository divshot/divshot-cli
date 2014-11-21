var _ = require('lodash');
var nash = require('nash');
var homeDir = require('home-dir');

var config = require('./config');

module.exports = function divshot (spec) {
  
  var members = {
    local: {
      config: config
    }
  };
  
  return Object.freeze(members);
};