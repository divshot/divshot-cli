load([
  'apps',
  'auth',
  'config',
  'create',
  'destroy',
  'domains',
  'init',
  'login',
  'logout',
  'promote',
  'protect',
  'push',
  'rename',
  'rollback',
  'server'
]);

function load (commands) {
  commands.forEach(function (command) {
    exports[command] = require('./' + command);
  });
}