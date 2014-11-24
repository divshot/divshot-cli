exports.register = function (imports) {
  
  var user = imports.user;
  var auth = function () {};
  
  auth.token = function (done) {
    
    done(null, user.token);
  };
  
  return auth;
};

exports.register.attributes = {
  name: 'auth'
};