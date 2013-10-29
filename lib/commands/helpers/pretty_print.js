var _ = require('lodash');

var prettyPrint = {
  object: function (app, obj) {
    var keys = app._.keys(obj);
    var maxKeyLen = app._.max(app._.map(keys, function (key) {
      return key.length;
    })) + 3;
    
    app._.each(keys, function (key) {
      var paddedKey = prettyPrint._addPadding(key, maxKeyLen);
      app.logger.info('  ' + paddedKey.bold + JSON.stringify(obj[key]));
    });
  },
  
  array: function (app, arr, key, value) {
    var maxKeyLen = app._.max(app._.map(arr, function (obj) {
      return obj[key].length;
    })) + 3;
    
    app._.each(arr, function (obj) {
      var objKey = obj[key];
      if (!objKey) return;
      
      var paddedKey = prettyPrint._addPadding(objKey, maxKeyLen);
      app.logger.info('  ' + paddedKey.bold + obj[value]);
    });
  },
  
  _addPadding: function (key, maxPadding) {
    var padding = _.map(Array(maxPadding - key.length), function () { return ' '; });
    return (key + ':').split('').concat(padding).join('');
  }
};

module.exports = prettyPrint;
