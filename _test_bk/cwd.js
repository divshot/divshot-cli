var path = require('path');
var expect = require('expect.js');
var setup = require('./_setup');
var Cwd = require('../lib/cwd.js');
var originalConfig = {
  name: "test",
  root: "./",
  clean_urls: true
};

describe('#Cwd()', function() {
  beforeEach(function () {
    process.cwd = function () {
      return setup.fixturesPath;
    };
    
    this.cwd = new Cwd();
  });
  
  afterEach(function () {
    this.cwd.setConfig(originalConfig, true);
    delete require.cache[this.cwd.filePath];
  });
  
  it('has a default config file name of divshot.json', function () {
    expect(this.cwd.configFileName).to.be('divshot.json');
  });
  
  it('has a default current working directory', function () {
    expect(this.cwd.cwd).to.equal(process.cwd());
  });
  
  it('has a default file path to the config file', function () {
    expect(this.cwd.filePath).to.be(path.join(setup.fixturesPath, this.cwd.configFileName));
  });
  
  it('gets the config file', function () {
    expect(this.cwd.getConfig()).to.eql(originalConfig);
  });
  
  it('sets new values from and object in the config file', function () {
    this.cwd.setConfig({name: 'new'});
    expect(this.cwd.getConfig().name).to.be('new');
  });
  
  it('sets the config value by overwriting all values', function () {
    this.cwd.setConfig({only: 'me'}, true);
    expect(this.cwd.getConfig()).to.eql({only: 'me'});
  });
  
  it('sets a single config value', function () {
    this.cwd.setConfigValue('name', 'new');
    expect(this.cwd.getConfig().name).to.be('new');
  });
  
  it('removes a single config value', function () {
    this.cwd.removeConfigValue('name');
    expect(this.cwd.getConfig().name).to.be(undefined);
  });
  
  it('determines if the current directory has a config file', function () {
    expect(this.cwd.hasConfig()).to.be(true);
  });
  
  it('stringifies and object with 2 space tab whitespace', function () {
    var stringified = this.cwd.stringify({name: 'test'});
    expect(stringified).to.equal('{\n  "name": "test"\n}');
  });
});