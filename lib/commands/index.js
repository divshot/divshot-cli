var commands = {
  account: require('./account'),
  apps: require('./apps'),
  auth: require('./auth'),
  changelog: require('./changelog'),
  config: require('./config'),
  create: require('./create'),
  destroy: require('./destroy'),
  domains: require('./domains'),
  emails: require('./emails'),
  env: require('./env'),
  files: require('./files'),
  hooks: require('./hooks'),
  init: require('./init'),
  login: require('./login'),
  logout: require('./logout'),
  open: require('./open'),
  performance: require('./performance'),
  promote: require('./promote'),
  protect: require('./protect'),
  pull: require('./pull'),
  push: require('./push'),
  rename: require('./rename'),
  rollback: require('./rollback'),
  server: require('./server'),
  stats: require('./stats'),
  status: require('./status'),
  unprotect: require('./unprotect'),
  dump: require('./dump'),
  cert: require('./cert')
};

exports.connect = function (cli) {
  Object.keys(commands).forEach(function (commandName) {
    commands[commandName](cli);
  });
};