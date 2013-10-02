var expect = require('chai').expect;
var app = require('../lib/divshot');

describe('Divshot cli', function () {
  it('is in the test environment', function () {
    expect(process.env.NODE_ENV).to.equal('test');
  });
});