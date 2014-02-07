load([
  'apps',
  'auth',
  'config',
  'create',
  'destroy',
  'domains',
  'init',
  'login',
  'logout'
]);

function load (commands) {
  commands.forEach(function (command) {
    exports[command] = require('./' + command);
  });
}