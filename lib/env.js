var env = {
  test: {
    PORT: 1337,
    API_HOST: 'http://localhost:' + 1337
  },
  production: {
    API_HOST: 'http://api.dev.divshot.com:9393'
  }
};

module.exports = env[process.env.NODE_ENV];