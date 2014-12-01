var getConfig = require('../lib/config');
var test = require('tapes');
var fs = require('fs');

var config = test('config');

config.test('loads', function (t) {
  
  var removeFile = createConfigFile({
    name: 'my-app',
    root: './'
  });
  
  var config = getConfig();
  
  t.equal(config.name, 'my-app', 'loads app config file');
  t.equal(config.root, './', 'loads app config file');
  
  removeFile();
  t.end();
});

config.test('custom config file', function (t) {
  
  var removeFile1 = createConfigFile({
    name: 'my-app',
    root: './'
  }, 'custom.json');
  
  var removeFile2 = createConfigFile({
    name: 'my-app',
    root: './'
  }, 'another.json');
  
  var c1 = getConfig({file: 'custom.json'});
  t.equal(c1.name, 'my-app', 'loaded custom config file');
  
  var c2 = getConfig({file: ['custom.json', 'another.json']});
  
  removeFile1();
  removeFile2();
  t.end();
});

config.test('set config data', function (t) {
  
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

config.test('saves data to config file', function (t) {
  
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

config.test('toJSON', function (t) {
  
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

config.test('toString', function (t) {
  
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