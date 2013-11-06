var path = require('path');
var expect = require('expect.js');
var setup = require('./_setup');
var User = require('../lib/user.js');
var originalConfig = {
  token: "token"
};

describe('#User()', function() {
  beforeEach(function () {
    this.configDir = setup.fixturesPath;
    this.user = new User(this.configDir);
  });
  
  afterEach(function () {
    this.user.attributes = originalConfig;
    this.user.save();
    delete require.cache[this.user.filePath];
  });
  
  it('has a default base directory', function () {
    expect(this.user.baseDir).to.be(this.configDir);
  });
  
  it('has a default file path', function () {
    expect(this.user.filePath).to.be(path.join(this.configDir, 'config', 'user.json'));
  });
  
  it('gets the config file on object instantiation', function () {
    expect(this.user.attributes).to.not.be({});
  });
  
  it('loads the config file', function () {
    var config = this.user.load();
    expect(config).to.not.eql({});
    expect(this.user.attributes).to.eql(config);
  });
  
  it('saves all attributes to the config file', function () {
    var obj = {key: 'value'};
    this.user.attributes = obj;
    this.user.save();
    delete require.cache[this.user.filePath];
    
    expect(this.user.load()).to.eql(obj);
  });
  
  it('gets an attribute from the config', function () {
    expect(this.user.get('token')).to.equal('token');
  });
  
  it('sets an attribute', function () {
    this.user.set('token', 'token2');
    expect(this.user.get('token')).to.equal('token2');
  });
  
  it('logs the user out by deleting the token from the config file', function () {
    this.user.logout();
    
    expect(this.user.get('token')).to.be(undefined);
    
    delete require.cache[this.user.filePath];
    expect(this.user.load().token).to.be(undefined);
  });
  
  it('determines if the user is authenticated', function () {
    expect(this.user.authenticated()).to.not.be(false);
    expect(this.user.authenticated()).to.not.be(undefined);
  });
});