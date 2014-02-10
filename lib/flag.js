var argsList = require('args-list');
var _ = require('lodash');

function Flag (options) {
  this._aliases = options.aliases;
  this._description = '(No description given)';
  this._action = {
    args: [],
    fn: function () {}
  }
  this._exit = false;
};

Flag.prototype.description = function (desc) {
  this._description = desc;
  return this;
};

Flag.prototype.action = function (fn) {
  var args = _.initial(argsList(fn));
  
  this._action = {
    args: args,
    fn: fn
  };
  
  return this;
};

Flag.prototype.execute = function (arg) {
  this._action.fn.call(this, arg);
};

Flag.prototype.exit = function (shouldExit) {
  this._exit = shouldExit;
};

module.exports = Flag;