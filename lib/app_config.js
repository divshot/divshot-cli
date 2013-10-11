var path = require('path');
var fs = require('fs');

var appConfig = {
  _fileName: 'divshot.json',
  
  getAll: function (callback) {
    try{
      var config = require(path.join(process.cwd(), appConfig._fileName));
      callback(null, config);
    }
    catch(e) {
      callback('NO_CONFIG');
    }
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