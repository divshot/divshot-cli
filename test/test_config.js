process.env.NODE_ENV = 'test';

var env = require('../lib/env');
var _defaults = require('lodash.defaults');

_defaults(process.env, env);
