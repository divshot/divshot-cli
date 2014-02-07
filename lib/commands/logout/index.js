exports.require = ['user'];

exports.register = function () {
  this.user.logout();
  this.update('Logged out', {success: true});
  this.done();
};