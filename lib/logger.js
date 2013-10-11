var logger = {
  write: function (msg) {
    process.stdout.write(msg);
    return this;
  },
  
  writeln: function (msg) {
    logger.write('\n' + msg);
    return this;
  },
  
  info: function (msg) {
    return console.log(msg);
  },
  
  success: function (msg) {
    return console.log('Success:'.green + ' ' + msg);
  },
  
  warn: function (msg) {
    return console.log('Warning:'.yellow + ' ' + msg);
  },
  
  error: function (msg) {
    return console.log('Error:'.red + ' ' + msg);
  }
};

module.exports = logger;