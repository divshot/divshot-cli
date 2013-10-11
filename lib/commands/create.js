var cli = require('../divshot');
var path = require('path');
var request = require('request');
var winston = require('winston');
var regular = require('regular');
var fs = require('fs');

var internals = {
  userConfig: cli.config.stores.user,
  schema: {
    properties: {
      name: {
        pattern: regular.slug,
        required: true
      }
    }
  }
};

var create = module.exports = function (appName, callback) {
  cli.api.apps.create({
    name: appName
  }, function (err, response) {
    if (err) {
      return winston.error(err);
    }
    
    fs.writeFileSync('divshot.json', JSON.stringify({
      name: appName
    }, null, 2));
    
    console.log('\n' + appName.green + ' has been created.'.green);
  });
};

create.internals = internals;
create.usage = ['Create a Divshot.io app'];
