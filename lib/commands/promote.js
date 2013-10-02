var app = require('../divshot');

module.exports = function (from, to, callback) {
  console.log('Promoting from', from.yellow, 'to', to.green);
};

module.exports.usage = ['Promote this app from one environment to another'];