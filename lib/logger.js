var logger = {
  _msg: function (msg) {
    return msg || '';
  },
  
  write: function (msg) {
    msg = msg || '';
    
    process.stdout.write(logger._msg(msg));
    return this;
  },
  
  writeln: function (msg) {
    logger.write('\n' + logger._msg(msg));
    return this;
  },
  
  info: function (msg) {
    return console.log(logger._msg(msg));
  },
  
  success: function (msg) {
    return console.log('Success:'.green + ' ' + logger._msg(msg));
  },
  
  warn: function (msg) {
    msg = msg || '';
    return console.log('Warning:'.yellow + ' ' + logger._msg(msg));
  },
  
  error: function (msg) {
    msg = msg || '';
    return console.log('Error:'.red + ' ' + logger._msg(msg));
  }
};

module.exports = logger;