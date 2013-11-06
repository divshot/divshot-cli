var path = require('path');
var expect = require('expect.js');
var setup = require('./_setup');
var Cwd = require('../lib/cwd.js');

describe('#Cwd()', function() {
  beforeEach(function () {
    this.cwd = new Cwd();
    
    process.cwd = function () {
      return setup.fixturesPath;
    };
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
    expect(this.cwd.getConfig()).to.eql({
      name: "test",
      root: "./",
      clean_urls: true
    });
  });
});