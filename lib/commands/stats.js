var _ = require('lodash');
var format = require('chalk');
var bytes = require('bytes');
var pluralize = require('pluralize');

module.exports = function (cli) {
  
  cli.command('stats')
    .description('Show various stats for your app')
    .before('authenticate', 'isApp')
    .handler(function (done) {
      
      var appName = cli.cwd.getConfig().name;
      
      cli.api.apps.id(appName).stats(function (err, stats) {
        
        var stats = _(stats)
          .map(function (value, key) {
            
            var title = caseWords(key);
            var description = parseDescription(value);
            
            return [title, description];
          })
          .zipObject()
          .value();
        
        cli.log();
        cli.log('  Stats for ' + format.bold(appName));
        cli.log();
        cli.logObject(stats);
        
        done();
      });
    });
};

function parseDescription (data) {
  // 0.65 GB (800 requests)
  
  return bytes(data.bandwidth) + ' (' + abbreviateNumber(data.requests) + ' ' + pluralize('requests', data.requests) + ')';
}

function caseWords (sentence) {
  return sentence.split('_').map(function (word) {
    return ucfirst(word);
  }).join(' ');
}

function ucfirst (s) {
  return s.substr(0, 1).toUpperCase() + s.substring(1);
};

function abbreviateNumber(value) {
  var newValue = value;
  if (value >= 1000) {
      var suffixes = ["", "k", "m", "b","t"];
      var suffixNum = Math.floor( (""+value).length/3 );
      var shortValue = '';
      for (var precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
          var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
          if (dotLessShortValue.length <= 2) { break; }
      }
      if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
      newValue = shortValue+suffixes[suffixNum];
  }
  return newValue;
}