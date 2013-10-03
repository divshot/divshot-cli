var expect = require('chai').expect;
var sinon = require("sinon");
var stubRequire = require('proxyquire');
var divshot = require('../../lib/divshot');
var depStubs = {
  request: function (options, callback) {
    callback(null, {
      headers: {
        location: 'asdf#token=my_token'
      }
    }, 'body');
  },
  winston: {
    error: function () {}
  }
};
var login = stubRequire('../../lib/commands/login', depStubs);

describe('Login', function () {
  
  it('gets an auth token from the api', function (done) {
    login.internals.getToken('email@email.com', 'password1', function (err, token) {
      expect(err).to.be.null;
      expect(token).to.equal('my_token');
      done();
    });
  });
  
  it('sets the user config file reference', function () {
    expect(login.internals.userConfig).to.not.be.undefined;
  });
  
  it('saves the auth token to the user config file', function () {
    var userConfig = login.internals.userConfig;
    var callbackSpy = sinon.spy();
    
    sinon.spy(userConfig, 'set');
    sinon.spy(userConfig, 'save');
    
    login.internals.saveToken('my_token', callbackSpy);
    
    expect(userConfig.set.called).to.be.ok;
    expect(userConfig.save.called).to.be.ok;
    expect(userConfig.save.getCall(0).args[0]).to.eql(callbackSpy);
  });
  
  it('parses the token from the api location header', function () {
    var headers1 = {
      location: 'http://redirect.com/#token=my_token'
    };
    var headers2 = {};
    
    var token1 = login.internals.parseTokenFromHeaders(headers1);
    var token2 = login.internals.parseTokenFromHeaders(headers2);
    
    expect(token1).to.equal('my_token');
    expect(token2).to.be.undefined;
  });
  
  it('handles the login prompt callback', function () {
    var callbackSpy = sinon.spy();
    sinon.spy(login.internals, 'saveToken');
    
    login.internals.loginHandler(callbackSpy)(null, {
      email: 'asdf@asdf.com',
      password: 'password1'
    });
    
    var args = login.internals.saveToken.getCall(0).args;
    
    expect(login.internals.saveToken.called).to.be.ok;
    expect(args[0]).to.equal('my_token');
    expect(args[1]).to.eql(callbackSpy);
  });
  
  it('logs the user in from the prompt', function () {
    sinon.spy(divshot.prompt, 'get');
    login();
    
    expect(divshot.prompt.get.called).to.be.ok;
    expect(divshot.prompt.get.getCall(0).args[0]).to.eql(login.internals.schema);
  });
  
  describe('Schema', function () {
    var properties = login.internals.schema.properties;
    
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