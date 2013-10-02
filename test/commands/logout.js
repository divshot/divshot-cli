var fs = require('fs');
var expect = require('chai').expect;
var stubRequire = require('proxyquire');
var divshot = stubRequire('../../lib/divshot', {});
var logout = stubRequire('../../lib/commands/logout', {
  winston: {
    info: function () {}
  }
});

describe('Logout', function () {
  var user;
  
  beforeEach(function (done) {
    user = divshot.config.stores.user;
    user.file = './.userconfig.json';
    user.dir = './';
    
    fs.writeFile(user.file, '{"email": "asdf","password": "asdf"}', done);
  });
  
  afterEach(function (done) {
    fs.unlink(user.file, done);
  });
  
  it('should remove the users credentials from the config file', function (done) {
    logout(function () {
      var userconfig = require('../../.userconfig.json');
      expect(userconfig).to.not.have.keys(['email', 'password']);
      done();
    });
  });
  
});