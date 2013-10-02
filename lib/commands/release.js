module.exports = function (environment, callback) {
  console.log('Releasing to', environment);
};

module.exports.usage = ['Release current app to and environment.'];