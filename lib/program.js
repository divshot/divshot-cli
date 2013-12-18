var program = require('commander');
var feedback = require('feedback');
var chalk = require('chalk');

module.exports = function (api, user, cwd) {
  
  program.Command.prototype.example = function (str) {
    if (!str) return this._example || '';
    
    this._example = str;
    return this;
  };

  program.Command.prototype.trigger = function (args) {
    args || (args = []);
    
    this.parent.emit(this._name, args);
    return this;
  };

  program.Command.prototype.handler = function (callback) {
    var self = this;
    callback || (callback = function () {});
    
    this.action(function () {
      if (this.token) {
        api.setToken(this.token);
        user.attributes.token = this.token;
      }
      
      if (this.rawArgs.indexOf('--no-color') > -1) feedback.color = false;
      
      if (self._withAuth && !user.authenticated()) {
        return feedback.error('You must be logged in to do that.');
      }
      
      if (self._withConfig) {
        self.config = cwd.getConfig();
        if (!self.config || !self.config.name) return feedback.error('Current directory is not a ' + chalk.blue('Divshot.io') + ' app');
      }
      
      if (this.app) {
        self.config = self.config || {};
        self.config.name = this.app;
      }
      
      callback.apply(self, arguments);
    });
    
    return this;
  };

  program.Command.prototype.withAuth = function () {
    this._withAuth = true;
    return this;
  };

  program.Command.prototype.withConfig = function () {
    this._withConfig = true;
    return this;
  };
  
  return program;
};