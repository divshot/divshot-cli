var format = require('chalk');

module.exports = {
  // misc
  DEFAULT: 'There was an unexpected error. Please try again.',
  NOT_AUTHENTICATED: 'You must log in with ' + format.bold('"divshot login"') + ' before you can do that.',
  DOMAIN_IN_USE: 'That domain is already in use.',
  FILES_NOT_RELEASED: 'Not all files released.',
  DIRECTORY_NOT_APP: 'The current directory is not an app. Please use ' + format.bold('divshot init') + ' to make this directory an app.',
  UNABLE_TO_AUTHENTICATE_TICKET: 'There was a problem authenticating. Please try again or contact support@divshot.com.',
  VOUCHER_USED: 'Unable to redeem voucher. It may have already been claimed.',
  VOUCHER_USED_BY_YOU: 'This voucher has already been applied to your account.',
  SERVER_ERROR: 'There was an unexexpted error with the server. Perhaps the port is already in use.',
  EMAIL_TAKEN: 'That email is already in use.',
  NOT_ADMIN: 'You do not have the access to perform this action to this app.',
  
  // missing
  MISSING_CONFIG_KEY: 'Config key name required.',
  MISSING_CONFIG_VALUE: 'Config value for key is required.',
  MISSING_PROMOTE_ENVIRONMENTS: 'You must provide the environment to promote and its destination environment.',
  MISSING_ENVIRONMENT: 'Application environment is required.',
  MISSING_CREDENTIALS: 'Credentials are required.',
  MISSING_APP_NAME: 'You must provide the app name.',
  MISSING_EMAIL: 'You must provide an email.',
  
  // invalid
  INVALID_TOKEN: 'Your session has expired or you have not logged in yet.',
  INVALID_DOMAIN: 'Invalid domain name. A valid domain looks like ' + format.bold('www.divshot.com') + '.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  INVALID_APP_NAME: 'Invalid app name.',
  INVALID_ENVIRONMENT: 'Invalid environment.',
  INVALID_TICKET: 'The authentication ticket is expired or invalid. Please try again.',
  INVALID_VOUCHER: 'Invalid voucher. Please provide a valid voucher code.',
  INVALID_EMAIL: 'Invalid email.',
  
  // Upgrade
  UPGRADE_TO_USE_FEATURE: 'You must upgrade to a paid plan in order to use this feature.',
  NO_PRODUCTION_SLOTS: 'You do not have any production slots available. Please downgrade an existing production app or visit ' + format.bold('https://dashboard.divshot.com') + ' to upgrade your account',
  
  // Does not exists
  DIRECTORY_DOES_NOT_EXIST: 'Your app\'s root directory does not exist.',
  MUST_HAVE_DEPLOYED_APP: 'Please deploy at least one version of your app before doing this.'
};
