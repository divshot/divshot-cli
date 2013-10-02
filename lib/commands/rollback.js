module.exports = function (environment, callback) {
  console.log('Rolling back to', environment.yellow);
};

module.exports.usage = ['Rollback current app to previous environment'];