var format = require('chalk');

module.exports = {
  // misc
  DEFAULT: 'There was an unexpected error. Please try again.',
  NOT_AUTHENTICATED: 'You must log in with ' + format.bold('"divshot login"') + ' before you can do that.',
  DOMAIN_IN_USE: 'That domain is already in use.',
  FILES_NOT_RELEASED: 'Not all files released.',
  
  // missing
  MISSING_CONFIG_KEY: 'Config key name required',
  MISSING_PROMOTE_ENVIRONMENTS: 'You must provide the environment to promote and its destination environment',
  MISSING_ENVIRONMENT: 'Application environment is required.',
  MISSING_CREDENTIALS: 'Credentials are required.',
  MISSING_APP_NAME: 'You must provide a name for the app.',
  
  // invalid
  INVALID_TOKEN: 'Your session has expired or you have not logged in yet.',
  INVALID_DOMAIN: 'Invalid domain name. A valid domain looks like ' + format.bold('www.divshot.com') + '.',
  INVALID_CREDENTIALS: 'Invalid credentials.'
};