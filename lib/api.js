var _ = require('lodash');
var ask = require('ask');
var getUser = require('./user');
var assert = require('assert');

// var API_HOST = process.env.API_HOST || 'https://api.divshot.com';

module.exports = function (spec) {
  
  spec = spec || {};
  
  assert.ok(spec.origin, '[divshot]: Api origin required');
  
  var user = spec.user || getUser();
  var apiOptions = {};
  var request = ask();
  
  request.origin(spec.origin);
  if (user.isAuthenticated()) {
    request.header('authorization', 'Bearer ' + user.token);
  }
  
  var api =  _.extend(
    {
      headers: request.headers
    },
    
    request.attributes
  );
  
  return api;
};