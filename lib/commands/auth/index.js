exports.require = ['user'];

exports.tasks = {
  token: function () {
    var token = this.user.get('token');
    this.update(token);
    this.done(null, token);
  }
};

exports.description = 'authentication help'
exports.tasks.token.description = 'show your authentication token';

exports.register = function () {
  this.done();
};