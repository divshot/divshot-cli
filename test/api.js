var fs = require('fs-extra');
var test = require('tape');
var homeDir = require('home-dir');

var getApi = require('../lib/api');
var getUser = require('../lib/user');

var USER_FILEPATH = homeDir('.divshot-test/user.json');

test('api: sets origin', function (t) {
  
  t.throws(function () {
    var api = getApi();
  }, 'expects an origin');
  
  var api = getApi({origin: 'http://localhost'});
  
  t.equal(api.origin, 'http://localhost', 'sets custom api origin');
  t.end();
});

test('api: takes custom origin and user object', function (t) {
  
  var user = getUser({file: USER_FILEPATH});
  user.token = 'token';
  user.save();
  var api = getApi({
    origin: 'custom origin',
    user: user
  });
  
  t.equal(api.origin, 'custom origin', 'custom origin');
  t.equal(api.headers.authorization, 'Bearer token', 'sets auth header based on custom user');
  
  fs.removeSync(homeDir('.divshot-test'));
  t.end();
});