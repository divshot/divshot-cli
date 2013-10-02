var env = {
  test: {
    API_HOST: 'http://api.dev.divshot.com:9393'
  },
  production: {
    API_HOST: 'http://api.dev.divshot.com:9393'
  }
};

module.exports = env[process.env.NODE_ENV];