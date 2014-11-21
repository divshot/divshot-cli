var getConfig = require('../lib/config');
var test = require('tape');
var fs = require('fs');

test('config: local config', function (t) {
  
  var removeFile = createConfigFile({
    name: 'my-app',
    root: './'
  });
  
  var config = getConfig();
  
  t.ok(config, 'config object');
  t.equal(config.name, 'my-app', 'loads app config file');
  t.equal(config.root, './', 'loads app config file');
  
  removeFile();
  t.end();
});

test('config: custom config file', function (t) {
  
  var removeFile = createConfigFile({
    name: 'my-app',
    root: './'
  }, 'custom.json');
  
  var c = getConfig({file: 'custom.json'});
  t.equal(c.name, 'my-app', 'loaded custom config file');
  
  removeFile();
  t.end();
});

test('config: set config data', function (t) {
  
  var removeFile = createConfigFile({
    name: 'my-app',
    root: './'
  });
  
  var config = getConfig();
  
  config.set({
    name: 'new-app-name'
  });
  t.equal(config.name, 'new-app-name', 'set config with object');
  
  removeFile();
  t.end();
});

test('config: saves data to config file', function (t) {
  
  var removeFile = createConfigFile({
    name: 'my-app',
    root: './'
  });
  
  var config = getConfig();
  config.key = 'value';
  config.save();
  t.deepEqual(getConfig().toJSON(), {
    name: 'my-app',
    root: './',
    key: 'value'
  }, 'saved values to config file');
  
  removeFile();
  t.end();
});

test('config: toJSON', function (t) {
  
  var removeFile = createConfigFile({
    name: 'my-app',
    root: './'
  });
  
  t.deepEqual(getConfig().toJSON(), {
    name: 'my-app',
    root: './'
  }, 'converts config object back to json');
  
  removeFile();
  t.end();
});

test('config: toString', function (t) {
  
  var removeFile = createConfigFile({
    name: 'my-app',
    root: './'
  });
  
  var config = getConfig();
  
  t.equal(config.toString(), '{\n  "name": "my-app",\n  "root": "./"\n}', 'stringified');
  
  removeFile();
  t.end();
});

function createConfigFile (data, name) {
  
  var filepath = process.cwd() + '/' + (name || 'divshot.json');
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  
  return function () {
    
    fs.unlinkSync(filepath);
  };
}