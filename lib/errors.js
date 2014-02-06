var format = require('chalk');

module.exports = {
  DEFAULT: 'There was an unexpected error. Please try again.',
  NOT_AUTHENTICATED: 'You must log in with ' + format.bold('"divshot login"') + ' before you can do that.',
  INVALID_TOKEN: 'Your session has expired or you have not logged in yet.',
  MISSING_CONFIG_KEY: 'Config key name required'
};