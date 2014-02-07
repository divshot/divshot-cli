var format = require('chalk');

module.exports = {
  DEFAULT: 'There was an unexpected error. Please try again.',
  NOT_AUTHENTICATED: 'You must log in with ' + format.bold('"divshot login"') + ' before you can do that.',
  MISSING_CONFIG_KEY: 'Config key name required',
  INVALID_TOKEN: 'Your session has expired or you have not logged in yet.',
  INVALID_DOMAIN: 'Invalid domain name. A valid domain looks like ' + format.bold('www.divshot.com') + '.',
  DOMAIN_IN_USE: 'That domain is already in use.',
  MISSING_PROMOTE_ENVIRONMENTS: 'You must provide the environment to promote and its destination environment'
};