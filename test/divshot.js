var path = require('path');
var expect = require('expect.js');
var setup = require('./_setup');
var _ = require('lodash');

var app = setup.app();

describe('cli init', function() {
  it('adds an instance of lodash to the app object', function () {
    expect(app._).to.eql(_);
  });
  
  it('adds an instance of loading to the app object', function () {
    expect(app.loading).to.eql(require('../lib/helpers/loading'));
  });
  
  it('adds an instance of feedback to the app object', function () {
    expect(app.logger).to.eql(require('feedback'));
  });
  
  it('adds an instance of user to the app object', function () {
    expect(app.user instanceof setup.User).to.be(true);
  });
  
  it('adds an instance of cwd to the app object', function () {
    expect(app.cwd instanceof require('../lib/cwd')).to.be(true);
  });
  
  it('adds an instance of the api to the app object', function () {
    expect(app.api instanceof setup.Divshot).to.be(true);
  });
  
  it('adds the environments to the app object', function () {
    expect(app.environments).to.contain('development', 'staging', 'production');
  });
  
  it('adds the command finder helper to the app object', function () {
    expect(app.command.toString()).to.eql(require('../lib/helpers/command')(app).toString());
  });
  
  it('adds the program commander to the app object', function () {
    expect(app.program).to.eql(require('../lib/program')(app.api, app.user, app.cwd));
  });
  
  it('loads the app commands', function () {
    expect(app.program.commands).to.not.be(undefined);
    expect(app.program.commands.length).to.be.above(1);
  });
  
  it('parses the process argsv', function () {
    expect(app.program.args).to.not.be(undefined);
  });
  
  it('overwrites defaults with user provided options', function () {
    expect(app.api).to.eql(setup.api);
  });
  
  describe('program options', function() {
    it('exposes "-v" to get the version number', function (done) {
      app.program.emit('-v');
      
      setup.feedback.once('write', function (msg) {
        expect(msg).to.be(require('../package').version);
        done();
      });
    });
    
    it('exposes "-p, --port" to set the port for the server', function () {
      expect(findShortFlag('-p', app.program.options)).to.not.be(undefined);
      expect(findLongFlag('--port', app.program.options)).to.not.be(undefined);
    });
      
    it('exposes "--host" to set the host for the server', function () {
      expectLongFlag('--host', app.program.options);
    });
    
    it('exposes "--logging" to enable print out of http requests', function () {
      expectLongFlag('--logging', app.program.options);
    });
    
    it('exposes "--token" to manually pass the user access token', function () {
      expectLongFlag('--token', app.program.options);
    });
    
    it('exposes "--app" to manually pass the user access token', function () {
      expectLongFlag('--app', app.program.options);
    });
    
    it('exposes "--no-color" to manually pass the user access token', function () {
      expectLongFlag('--no-color', app.program.options);
    });
  });
});

function expectLongFlag (flag, options) {
  expect(findLongFlag(flag, options)).to.not.be(undefined);
}

function findShortFlag (flag, options) {
  return findFlag('short', flag, options);
};

function findLongFlag (flag, options) {
  return findFlag('long', flag, options);
};

function findFlag (type, flag, options) {
  return _.find(options, function (opt) {
    return opt[type] === flag;
  });
}