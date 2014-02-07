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
  'promote'
]);

function load (commands) {
  commands.forEach(function (command) {
    exports[command] = require('./' + command);
  });
}