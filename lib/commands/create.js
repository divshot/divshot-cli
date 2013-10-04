var cli = require('../divshot');
var path = require('path');
var request = require('request');
var winston = require('winston');
var Divshot = require('divshot');

var internals = {
  userConfig: cli.config.stores.user
  
};

module.exports = function (appName, callback) {
  cli.api.apps.getAll(function (err, apps) {
    console.log(apps);
    apps.forEach(function (app) {
      console.log(app.name);
    });
  });
};

module.exports.internals = internals;
module.exports.usage = ['Create a Divshot.io app'];
