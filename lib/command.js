var _ = require('lodash');

function Command (options) {
  this._aliases = options.aliases;
  this._before = options.before || [];
  this._flags = [];
  this._description = '(No description given)';
  this._action = function (done) {done();};
  this._tasks = {};
}

Command.prototype.before = function () {
  this._before = _.toArray(arguments);
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

Command.prototype.action = function (fn) {
  this._action = fn;
  return this;
};

Command.prototype.task = function () {
  var aliases = _.toArray(arguments);
  var task = new Command({
    aliases: aliases,
    before: this._before
  });
  
  // Track our tasks
  _.each(aliases, function (alias) {
    this._tasks[alias] = task;
  }, this);
  
  return task;
};

Command.prototype.execute = function (args, callback) {
  this._action.apply(this, args.concat([callback]));
};

Command.prototype.executeTask = function (task, args, callback) {
  this._tasks[task].execute(args, callback);
};

Command.prototype.isTask = function (task) {
  return !!this._tasks[task];
};

module.exports = Command;