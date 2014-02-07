var _ = require('lodash');

function Command (options) {
  this._aliases = options.aliases;
  this._require = [];
  this._flags = [];
  this._description = '(No description given)';
}

Command.prototype.require = function () {
  this._require = _.toArray(arguments);
  return this;
};

Command.prototype.flags = function () {
  // TODO: parse these flags
  this._flags = _.toArray(arguments);
  return this;
};

Command.prototype.description = function (desc) {
  this._description = desc;
  return this;
};

Command.prototype.action = function () {
  var args = _.toArray(arguments);
  var fn = _.last(args);
  
  // Sub actions
  if (args.length > 1) {
    var action = _.initial(args);
    this._action[action] = fn;
  }
  else {
    this._action = fn;
  }
  
  return this;
};

Command.prototype.execute = function (callback) {
  this._action(callback);
};

Command.prototype.executeTask = function (task, args, callback) {
  args.push(callback);
  this._action[task].apply(this, args);
};

module.exports = Command;