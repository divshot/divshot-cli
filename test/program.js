var path = require('path');
var expect = require('expect.js');
var setup = require('./_setup');
var program = require('../lib/program.js');
var Cwd = require('../lib/cwd.js');
var User = require('../lib/user.js');

describe.only('#program()', function() {
  beforeEach(function () {
    this.user = new User(setup.fixturesPath);
    this.cwd = new Cwd();
    this.api = setup.api;
    this.program = program(this.api, this.user, this.cwd);
  });
  
  it('should do what...', function () {
    
  });
});