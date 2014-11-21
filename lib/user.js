var _ = require('lodash');
var fs = require('fs-extra');
var homeDir = require('home-dir');
var mkdirp = require('mkdirp');

var USER_CONFIG_FILEPATH = homeDir('.divshot/config/user.json');

module.exports = function (spec) {
  
  spec = spec || {};
  
  var filepath = spec.file || USER_CONFIG_FILEPATH;
  fs.ensureFileSync(filepath);
  var user = {};
  
  try {
    user = fs.readJsonSync(filepath);
  }
  catch (e) {}
  
  user.filepath = filepath;
  
  user.toJSON = function () {
    
    return _.omit(user, [
      'filepath',
      'toJSON',
      'save',
      'logout',
      'isAuthenticated'
    ]);
  };
  
  user.save = function () {
    
    fs.writeFileSync(filepath, JSON.stringify(user.toJSON(), null, 2));
    
    return user;
  };
  
  user.logout = function () {
    
    delete user.token;
    user.save();
    
    return user;
  };
  
  user.isAuthenticated = function () {
    
    return !!user.token;
  };
  
  return user;
};