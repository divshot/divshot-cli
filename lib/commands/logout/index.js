exports.require = ['user'];

exports.description = 'logout form Divshot';

exports.register = function () {
  this.user.logout();
  this.update('Logged out', {success: true});
  this.done();
};