var divshot = require('../lib');
var test = require('tape');
var homeDir = require('home-dir');
var fs = require('fs-extra');

// var app = divshot({
//   userDirectory: homeDir('.divshot')
// });

test('root: creates an app object', function (t) {
  
  var app = divshot();
  
  t.ok(app, 'object created');
  t.ok(app.local, 'local object');
  t.ok(app.local.config, 'config instantiator');
  t.ok(app.local.user, 'user instantiator');
  t.ok(app.api, 'api instantiator');
  t.end();
});

test('root: sets config directory', function (t) {
  
  var app1 = divshot();
  
  t.equal(app1.configRoot, homeDir('.divshot'), 'default config root');
  
  var app2 = divshot({
    configRoot: homeDir('.divshot-test')
  });
  
  t.equal(app2.configRoot, homeDir('.divshot-test'), 'custom config root');
  t.end();
});

test('root: clears all cached and saved data', function (t) {
  
  var configRoot = homeDir('.divshot-test');
  fs.ensureFileSync(configRoot);
  var app = divshot({
    configRoot: configRoot
  });
  
  t.ok(fs.existsSync(configRoot), 'config root exists');
  
  app.cleanCache();
  
  t.notOk(fs.existsSync(configRoot), 'config root deleted');
  t.end();
});

test('root: api', function (t) {
  
  var app1 = divshot();
  
  t.equal(app1.api.origin, 'https://api.divshot.com', 'default api origin');
  
  var app2 = divshot({
    api: {
      origin: 'custom origin'
    },
    appConfigFile: 'divshot.json',
    userConfigFile: 'usuer.json',
    configRoot: 'asdf'
  });
  
  t.equal(app2.api.origin, 'custom origin', 'custom api origin');
  t.end();
});

test('root: custom config files', function (t) {
  
  var app = divshot({
    appConfigFile: 'custom.json',
    configRoot: homeDir('.divshot-test')
  });
  
  t.equal(app.local.user.filepath, homeDir('.divshot-test') + '/config/user.json', 'set local user config file path');
  
  t.end();
});