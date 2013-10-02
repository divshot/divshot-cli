var expect = require('chai').expect;
var stubRequire = require('proxyquire');
var divshot = stubRequire('../lib/divshot', {});
var env = require('../lib/env');

describe('Divshot cli', function () {
  
  it('starts in the test environment', function () {
    expect(process.env.NODE_ENV).to.equal('test');
  });
  
  it('sets the user file store', function () {
    expect(divshot.config.stores.user).to.be.defined;
  });
  
});