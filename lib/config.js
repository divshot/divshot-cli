var fs = require('fs');

var _ = require('lodash');
var join = require('join-path');
var asArray = require('as-array');

module.exports = function (spec) {
  
  spec = spec || {};
  
  var config;
  // var filepath = join(process.cwd(), spec.file || 'divshot.json');
  
  var filepath = getFilePath(spec.file || 'divshot.json');
  
  // Only if file exists
  try{
    config = fs.readFileSync(filepath).toString();
  }
  catch(e) {}
  
  if (config) {
    // Only for valid JSON files
    try {
      config = JSON.parse(config);
    }
    catch (e) {
      config = undefined;
    }
  }
  
  // Ensure it is an object
  config = config || {};
  
  config.toJSON = function () {
    
    return _.omit(config, [
      'set',
      'get',
      'save',
      'toJSON',
      'toString'
    ]);
  };
  
  config.toString = function () {
    
    return JSON.stringify(config.toJSON(), null, 2);
  };
  
  config.set = function (data) {
    
    if (_.isObject(data)) {
      config = _.extend(config, data);
    }
    
    if (arguments.length === 2 && _.isString(arguments[0])) {
      config[arguments[0]] = arguments[1];
    }
    
    return config;
  };
  
  config.save = function () {
    
    fs.writeFileSync(filepath, JSON.stringify(config.toJSON(), null, 2));
    
    return config;
  };
  
  return config;
};

// Support strings or array for config file path
function getFilePath (paths) {
  
  return _(asArray(paths))
    .filter(function (p) {
      
      return fs.existsSync(join(process.cwd(), p));
    })
    .first();
}