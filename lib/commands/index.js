load([
  'apps',
  'auth',
  'config',
  'create',
  'destroy',
  'domains',
  'help',
  'init',
  'login',
  'logout',
  'promote',
  'protect',
  'push',
  'rename',
  'rollback',
  'server',
  'status',
  'unprotect'
]);

function load (commands) {
  commands.forEach(function (command) {
    exports[command] = require('./' + command);
  });
}