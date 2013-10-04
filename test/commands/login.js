var expect = require('chai').expect;
var sinon = require("sinon");
var stubRequire = require('proxyquire');
var cli = require('../../lib/divshot');
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
  },
  '../divshot': {
    api: {
      user: {
        credentials: {},
        setCredentials: function () {},
        authenticate: function (callback) {
          callback(null, 'my_token');
        }
      }
    }
  }
};
var login = stubRequire('../../lib/commands/login', depStubs);

describe('Login', function () {
  beforeEach(function () {
    sinon.stub(login.internals.userConfig, 'save');
  });
  
  afterEach(function () {
    login.internals.userConfig.save.restore();
  });
  
  it('sets the user config file reference', function () {
    expect(login.internals.userConfig).to.not.be.undefined;
  });
  
  it('saves the auth token to the user config file', function () {
    var userConfig = login.internals.userConfig;
    var callbackSpy = sinon.spy();
    
    sinon.spy(userConfig, 'set');
    
    login.internals.saveToken('my_token', callbackSpy);
    
    expect(userConfig.set.called).to.be.ok;
    expect(userConfig.save.called).to.be.ok;
    expect(userConfig.save.getCall(0).args[0]).to.eql(callbackSpy);
  });
  
  it('handles the login prompt callback', function () {
    var callbackSpy = sinon.spy();
    sinon.spy(login.internals, 'saveToken');
    
    login.internals.initLogin(callbackSpy)(null, {
      email: 'asdf@asdf.com',
      password: 'password1'
    });
    
    expect(login.internals.saveToken.calledWith('my_token', callbackSpy)).to.be.ok;
  });
  
  it('logs the user in from the prompt', function () {
    sinon.spy(cli.prompt, 'get');
    login();
    
    expect(cli.prompt.get.called).to.be.ok;
    expect(cli.prompt.get.calledWith(login.internals.schema)).to.be.ok;
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