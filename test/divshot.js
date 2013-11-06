var path = require('path');
var expect = require('expect.js');
var program = require('../lib/divshot');
var Mocksy = require('mocksy');
var _ = require('lodash');
var feedback = require('feedback');
var PORT = 7654;
var mocksy = new Mocksy({port: PORT});

var User = require('../lib/user');
var Divshot = require('divshot');
var configDir = path.resolve(__dirname, './fixtures');

feedback.test = true;

var api = Divshot.createClient({
  token: 'token',
  host: 'http://localhost:' + PORT
});
var app = program({
  logger: feedback,
  user: new User(configDir),
  api: api
});

describe('cli init', function() {
  it('adds an instance of lodash to the app object', function () {
    expect(app._).to.eql(require('lodash'));
  });
  
  it('adds an instance of loading to the app object', function () {
    expect(app.loading).to.eql(require('../lib/helpers/loading'));
  });
  
  it('adds an instance of feedback to the app object', function () {
    expect(app.logger).to.eql(require('feedback'));
  });
  
  it('adds an instance of user to the app object', function () {
    expect(app.user instanceof User).to.be(true);
  });
  
  it('adds an instance of cwd to the app object', function () {
    expect(app.cwd instanceof require('../lib/cwd')).to.be(true);
  });
  
  it('adds an instance of the api to the app object', function () {
    expect(app.api instanceof Divshot).to.be(true);
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
  
  it('overwrites defaults with user provided optiosn', function () {
    expect(app.api).to.eql(api);
  });
  
  describe('program options', function() {
    it('exposes "-v" to get the version number', function (done) {
      app.program.emit('-v');
      
      feedback.on('write', function (msg) {
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