var environments = ['development', 'staging', 'production'];

environments.isEnvironment = function (env) {
  return environments.indexOf(env) > -1;
};

environments.default = function () {
  return 'production';
};

module.exports = environments;

