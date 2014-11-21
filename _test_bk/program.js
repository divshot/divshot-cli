var path = require('path');
var expect = require('expect.js');
var sinon = require('sinon');
var feedback = require('feedback');
var setup = require('./_setup');
var program = require('../lib/program.js');
var Cwd = require('../lib/cwd.js');
var User = require('../lib/user.js');
var commander = require('commander');

describe('#program()', function() {
  beforeEach(function () {
    this.user = new User(setup.fixturesPath);
    this.cwd = new Cwd();
    this.api = setup.api;
    this.program = program(this.api, this.user, this.cwd);
  });
  
  it('initiates a #Commander() program', function () {
    expect(this.program).to.eql(commander);
  });
  
  describe('extending #Commander()', function() {
    it('sets up an example to display in cli help', function () {
      this.program.example('my example');
      expect(this.program._example).to.be('my example');
    });
    
    it('allows us to trigger a command', function () {
      this.program.parent || (this.program.parent = {emit: function () {}});
      sinon.spy(this.program.parent, 'emit');
      this.program.trigger(['arg1', 'arg2']);
      
      expect(this.program.parent.emit.args[0][1]).to.contain('arg1', 'arg2');
      
      this.program.parent.emit.restore();
    });
    
    describe('#handler()', function() {
      it('executes the handler on command call', function () {
        var spy = sinon.spy();
        var command = this.program.command('testHandler').handler(spy).trigger();
        expect(spy.called).to.be(true);
      });
      
      it('sets the api token of a token is passed in the command chain', function () {
        this.program.Command.prototype.token = 'testToken';
        triggerCommand(this.program);
        expect(this.api.options.token).to.be('testToken');
      });
      
      // TODO: figure out how to test this
      it.skip('disables all bash colors', function () {
        this.program.Command.prototype.rawArgs = ['--no-color'];
        triggerCommand(this.program);
        expect(feedback.color).to.be(false);
      });
      
      // TODO: this passes when run by itself, but fails
      // when run with the other tests. Something to do
      // with it not authenticating properly.
      it.skip('exits with no auth error if user is not authenticated', function (done) {
        this.user.attributes.token = undefined;
        this.program.command('testHandler').withAuth().handler().trigger();
        printsError(done);
      });
      
      // TODO: this passes when run by itself, but fails
      // when run with the other tests. Something to do
      // with it not authenticating properly.
      it.skip('exits with a no config error if current directory has no config file', function (done) {
        this.program.command('testHandler').withConfig().handler().trigger();
        printsError(done);
      });
      
      it('uses the app name when available', function () {
        this.program.Command.prototype.app = 'customAppName';
        var command = this.program.command('testHandler').handler().trigger();
        expect(command.config.name).to.be('customAppName');
      });
    });
    
    it('sets the auth flag to require auth for a command', function () {
      this.program.withAuth();
      expect(this.program._withAuth).to.be(true);
    });
    
    it('sets the config flag to check for a config file before each command', function () {
      this.program.withConfig();
      expect(this.program._withConfig).to.be(true);
    });
  });
});

function triggerCommand (program) {
  return program.command('testHandler').handler().trigger();
}

function printsError (done) {
  feedback.once('write', function (msg) {
    expect(msg.indexOf('Error:')).to.be.above(-1);
    done();
  });
}