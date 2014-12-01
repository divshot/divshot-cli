var getAuth = require('../../lib/commands/auth');var getApi = require('../../lib/api');
var divshot = require('../../lib');
var getUser = require('../../lib/user');
var test = require('tapes');
var homeDir = require('home-dir');
var fs = require('fs-extra');

var USER_FILEPATH = homeDir('.divshot-test/user.json');

var auth = test('auth');

auth.test('attaches app', function (t) {
  
  var app = divshot({
    configRoot: homeDir('.divshot-test')
  });
  
  var user = app.local.user;
  user.token = 'test token';
  user.save();
  
  app.auth.token(function (err, token) {
    
    t.equal(token , 'test token', 'gets token');
    
    fs.removeSync(homeDir('.divshot-test'));
    t.end();
  });
});