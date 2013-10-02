var expect = require('chai').expect;
var stubRequire = require('proxyquire');

describe('Login', function () {
  
  describe('Schema', function () {
    var login = stubRequire('../../lib/commands/login', {});
    var properties = login.schema.properties;
    
    it('sets the login schema for an email', function () {
      expect(properties).to.have.keys(['email', 'password']);
    });
    
    it('validates the email input', function () {
      var emailRegex = new RegExp(properties.email.pattern);
      
      expect(emailRegex.test('email@email.com')).to.true;
      expect(emailRegex.test('email@email')).to.be.false;
    });
    
    it('requires email', function () {
      expect(properties.email.required).to.be.true;
    });
    
    it('sets the password as a hidden field', function () {
      expect(properties.password.hidden).to.be.true;
    });
  });
  
});