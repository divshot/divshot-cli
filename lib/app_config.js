var path = require('path');
var fs = require('fs');

var appConfig = {
  _fileName: 'divshot.json',
  
  getAll: function (callback) {
    var error;
    try{
      var configPath = path.join(process.cwd(), appConfig._fileName);
      console.log("Looking for divshot config @ " + configPath)
      var config = require(configPath);
    }
    catch(e) {
      error = 'NO_CONFIG: ' + e;
    }
    callback(error, config);
  },
  
  set: function (attr, value, callback) {
    var obj = {};
    var config;
    
    try{
      config = require(path.join(process.cwd(), appConfig._fileName));
      config[attr] = value;
    }
    catch(e) {}
    finally {
      config = config || {};
      config[attr] = value;
      fs.writeFile(appConfig._fileName, JSON.stringify(config, null, 2), callback);
    }
  }
};

module.exports = appConfig;