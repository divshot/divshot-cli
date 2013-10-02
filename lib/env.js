var env = {
  development: {
    API_HOST: 'http://api.dev.divshot.com:9393'
  },
  test: {},
  staging: {},
  production: {}
};

module.exports = env[process.env.NODE_ENV];