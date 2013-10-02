var divshot = require('../divshot');

function login (callback) {
  divshot.prompt.get(login.schema, function (err, result) {
    if (err) {
      return console.log(err.message.red);
    }
    
    var user = divshot.config.stores.user;
    
    user.set('email', result.email);
    user.set('password', result.password);
    user.save(function (err) {
      
    });
  });
}

login.schema = {
  properties: {
    email: {
      pattern: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: 'Email must be valid',
      required: true
    },
    password: {
      hidden: true,
    }
  }
};

module.exports = login;
module.exports.usage = ['Login to the Divshot api'];