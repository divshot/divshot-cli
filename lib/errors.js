var format = require('chalk');

module.exports = {
  // misc
  DEFAULT: 'There was an unexpected error. Please try again. If the problem persists, please contact support.',
  NOT_AUTHENTICATED: 'You must log in with ' + format.bold('"divshot login"') + ' before you can do that.',
  DOMAIN_IN_USE: 'That domain is already in use.',
  FILES_NOT_RELEASED: 'Not all files released.',
  DIRECTORY_NOT_APP: 'The current directory is not an app. Please use ' + format.bold('divshot init') + ' to make this directory an app.',
  UNABLE_TO_AUTHENTICATE_TICKET: 'There was a problem authenticating. Please try again or contact support@divshot.com.',
  VOUCHER_USED: 'Unable to redeem voucher. It may have already been claimed.',
  VOUCHER_USED_BY_YOU: 'This voucher has already been applied to your account.',
  SERVER_ERROR: 'There was an unexpected error with the server. Perhaps the port is already in use.',
  EMAIL_TAKEN: 'That email is already in use.',
  NOT_ADMIN: 'You do not have access to perform this action on this app.',
  SERVER_NOT_AVAILABLE: 'There was an error reaching our servers. Please contact support.',
  BLANK_BUILD: 'You must deploy to this environment before you can execute this command.',
  
  // auth
  AUTH_TICKET_ERROR: 'There was an error generating an authorization session. Please try again. If this problem persists, please contact support.',
  
  // missing
  MISSING_CONFIG_KEY: 'Config key name is required.',
  MISSING_CONFIG_VALUE: 'Config value for key is required.',
  MISSING_PROMOTE_ENVIRONMENTS: 'You must provide the environment to promote and its destination environment.',
  MISSING_ENVIRONMENT: 'Application environment is required.',
  MISSING_CREDENTIALS: 'Credentials are required.',
  MISSING_APP_NAME: 'You must provide an app name.',
  MISSING_EMAIL: 'You must provide an email.',
  
  // invalid
  INVALID_TOKEN: 'Your session has expired or you have not logged in yet.',
  INVALID_DOMAIN: 'Invalid domain name. A valid domain looks like ' + format.bold('www.divshot.com') + '.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  INVALID_APP_NAME: 'Invalid app name.',
  INVALID_ENVIRONMENT: 'Invalid environment provided.',
  INVALID_TICKET: 'The authentication ticket is expired or invalid. Please try again.',
  INVALID_VOUCHER: 'Invalid voucher. Please provide a valid voucher code.',
  INVALID_EMAIL: 'Invalid email.',
  INVALID_URL: 'Please provide a valid url.',
  INVALID_HOOK_ID: 'That hook either does not exist or there was an error contacting our servers. Please try again or contact support.',
  INVALID_CERT: ' Invalid certificate or key. Please see ' + format.underline('http://docs.divshot.com/guides/ssl') + ' for help with certificates.',
  INVALID_RELEASE_VERSION: 'App release version does not exist.',
  
  // Upgrade
  UPGRADE_TO_USE_FEATURE: 'You must upgrade to a paid plan in order to use this feature.',
  UPGRADE_FOR_NON_PROD_DOMAINS: 'You must upgrade to a paid plan in order to use custom domains on non-production environments.',
  NO_PRODUCTION_SLOTS: 'You do not have any production slots available. Please downgrade an existing production app or visit ' + format.bold('https://dashboard.divshot.com') + ' to upgrade your account.',
  APP_NOT_PRODUCTION: 'This app is currently not a production app. SSL certificates require your app to be in production mode. Please see ' + format.underline('http://docs.divshot.com/guides/ssl') + ' for more information.',
  
  // Does not exists
  DIRECTORY_DOES_NOT_EXIST: 'Your app\'s root directory does not exist.',
  MUST_HAVE_DEPLOYED_APP: 'Please deploy at least one version of your app before doing this.'
};
