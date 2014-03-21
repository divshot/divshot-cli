var commands = {
  apps: require('./apps'),
  auth: require('./auth'),
  config: require('./config'),
  create: require('./create'),
  destroy: require('./destroy'),
  domains: require('./domains'),
  init: require('./init'),
  login: require('./login'),
  logout: require('./logout'),
  open: require('./open'),
  promote: require('./promote'),
  protect: require('./protect'),
  push: require('./push'),
  rename: require('./rename'),
  rollback: require('./rollback'),
  server: require('./server'),
  status: require('./status'),
  unprotect: require('./unprotect'),
  env: require('./env')
};

exports.connect = function (cli) {
  Object.keys(commands).forEach(function (commandName) {
    commands[commandName](cli);
  });
};