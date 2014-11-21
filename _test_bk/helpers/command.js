var expect = require('expect.js');
var setup = require('../_setup');
var app = {program: {commands: [{_name: 'testName'}]}};
var command = require('../../lib/helpers/command')(app);

describe('command helper', function() {
  it('should find a command by the command name', function () {
    expect(command('testName')).to.not.be(undefined);
  });
});