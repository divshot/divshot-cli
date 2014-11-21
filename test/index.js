var divshot = require('../lib');
var test = require('tape');
var fs = require('fs');

// var app = divshot({
//   userDirectory: homeDir('.divshot')
// });

// // Local stuff
// var config = app.local.conifg();
// config.set({});
// // or
// config.set('key', 'value');
// // or
// // Object.defineProperty(o, "b", { get: function () { return this.a + 1; } });
// // or
// config.save();

// var user = app.local.user();
// user.set({token: token});
// // or
// user.token = token  // using getters/setters ecmascript 5 stuff
// // Object.defineProperty(o, "b", { get: function () { return this.a + 1; } });
// user.token;
// // or
// user.save();

test('creates an app object', function (t) {
  
  var app = divshot();
  
  t.ok(app, 'object created');
  t.ok(app.local, 'local object');
  t.ok(app.local.config, 'config instantiator');
  t.end();
});

test('local user');