var fs = require('fs-extra');

var getUser = require('../lib/user');
var test = require('tapes');
var homeDir = require('home-dir');

var TEST_FILEPATH = homeDir('.divshot-test/user.json');

var user = test('user');

user.test('loads', function (t) {
  
  var user = getUser();
  var expectedFilepath = homeDir('.divshot/config/user.json');
  
  t.ok(fs.readFileSync(expectedFilepath), 'ensures file always exists');
  t.equal(user.filepath, expectedFilepath, 'sets filepath');
  t.ok(user, 'user object');
  t.end();
});

user.test('custom config file', function (t) {
  
  var filepath = homeDir('.divshot-test/user.json');
  var user = getUser({file: filepath});
  
  t.equal(user.filepath, filepath, 'set custom filepath');
  
  fs.removeSync(homeDir('.divshot-test'));
  t.end();
});

user.test('toJSON', function (t) {
  
  var user = getUser();
  
  t.notOk(user.toJSON().filepath, 'removes filepath');
  t.notOk(user.toJSON().toJSON, 'removes toJSON method');
  t.notOk(user.toJSON().save, 'removes save method');
  t.notOk(user.toJSON().logout, 'removes logout method');
  t.notOk(user.toJSON().isAuthenticated, 'removes isAuthenticated method');
  t.end();
});

user.test('saves data to user config file', function (t) {
  
  var user = getUser({file: TEST_FILEPATH});
  
  user.testing = 'testing';
  user.save();
  
  t.deepEqual(getUser({file: TEST_FILEPATH}).toJSON(), {
    testing: 'testing'
  }, 'saved data');
  
  fs.removeSync(homeDir('.divshot-test'));
  t.end();
});

user.test('logs user out', function (t) {
  
  var user = getUser({file: TEST_FILEPATH});
  
  user.token = 'my token';
  user.save();
  user.logout();
  
  t.deepEqual(getUser({file: TEST_FILEPATH}).toJSON(), {}, 'deleted token');
  
  fs.removeSync(homeDir('.divshot-test'));
  t.end();
});

user.test('determines if user is authenticated', function (t) {
  
  var user = getUser({file: TEST_FILEPATH});
  
  t.notOk(user.isAuthenticated(), 'is not authenticated');
  
  user.token = 'my token';
  user.save();
  
  t.ok(user.isAuthenticated(), 'is authenticated');
  
  fs.removeSync(homeDir('.divshot-test'));
  t.end();
});

user.test('deletes user config file', function (t) {
  
  var user = getUser({file: TEST_FILEPATH});
  
  t.ok(fs.existsSync(TEST_FILEPATH), 'test user config file created');
  
  user.remove();
  
  t.notOk(fs.existsSync(TEST_FILEPATH), 'deleted user config file');
  t.end();
});
