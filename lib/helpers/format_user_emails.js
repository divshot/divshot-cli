var format = require('chalk');

module.exports = function (emails) {
  return emails.map(function (email) {
    var address = email.address;
    
    if (!email.confirmed) address += ' (unconfirmed)';
    if (email.primary) address += ' (primary)';
    
    return address;
  });
};