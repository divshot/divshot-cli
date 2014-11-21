var path = require('path');
var Mocksy = require('mocksy');
var _ = require('lodash');
var feedback = exports.feedback = require('feedback');
var Divshot = exports.Divshot = require('divshot');
var program = exports.program = require('../lib/divshot');
var PORT = 7654;
var mocksy = new Mocksy({port: PORT});
var User = exports.User = require('../lib/user');
var configDir = exports.configDir = path.resolve(__dirname, './fixtures');
var fixturesPath = exports.fixturesPath = path.join(__dirname, './fixtures');

feedback.test = true;

var api = exports.api = Divshot.createClient({
  token: 'token',
  host: 'http://localhost:' + PORT
});

var app = exports.app = function () {
  return _.clone(program({
    logger: feedback,
    user: new User(configDir),
    api: api
  }));
};