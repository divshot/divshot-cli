var app = require('../divshot');

module.exports = function (callback) {
  var schema = {
    properties: {
      email: {
        // pattern: /^[a-zA-Z\s\-]+$/,
        // message: 'Name must be only letters, spaces, or dashes',
        required: true
      },
      password: {
        hidden: true
      }
    }
  };
  
  app.prompt.get(schema, function (err, result) {
    console.log('Command-line input received:');
    console.log('  email: ' + result.email);
    console.log('  password: ' + result.password);
  });
};

module.exports.usage = ['Rollback current app to previous environment'];