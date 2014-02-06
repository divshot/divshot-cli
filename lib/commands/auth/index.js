exports.require = ['user'];

exports.tasks = {
  token: function () {
    var token = this.user.get('token');
    this.update(token);
    this.done(null, token);
  }
};

exports.register = function () {
  this.done();
};