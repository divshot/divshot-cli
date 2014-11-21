var divshot = require('../lib');
var test = require('tape');

// var app = divshot({
//   userDirectory: homeDir('.divshot')
// });

test('creates an app object', function (t) {
  
  var app = divshot();
  
  t.ok(app, 'object created');
  t.ok(app.local, 'local object');
  t.ok(app.local.config, 'config instantiator');
  t.ok(app.local.user, 'user instantiator');
  t.end();
});

test('local user');