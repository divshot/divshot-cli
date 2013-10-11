var expect = require('chai').expect;
var sinon = require('sinon'); 
var stubRequire = require('proxyquire');
var create = stubRequire('../../lib/commands/create', {});
var cli = require('../../lib/divshot');

describe.only('divshot create [name]', function () {
  
  it('sets the user config file reference', function () {
    expect(create.internals.userConfig).to.not.be.undefined;
  });
  
  it('gets the the application name from the user', function () {
    sinon.spy(cli.prompt, 'get');
    
    create();
    
    expect(cli.prompt.get.called).to.be.ok;
  });
  
  describe('Schema', function () {
    var properties = create.internals.schema.properties;
    
    it('sets the create schema for an app name', function () {
      expect(properties).to.have.keys(['name']);
    });
    
    it('validates the app name input', function () {
      var nameRegexp = new RegExp(properties.name.pattern);
      
      expect(nameRegexp.test('a-slug')).to.true;
      expect(nameRegexp.test('bad slug!_')).to.be.false;
    });
    
    it('requires an app name', function () {
      expect(properties.name.required).to.be.true;
    });
  });
  
});