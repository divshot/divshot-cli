var commands = require('./commands');

module.exports = function (divshot) {
  Object.keys(commands).forEach(function (command) {
    
    // Set up command
    divshot[command] = handler(command);
    
    // Set up tasks
    var tasks = commands[command].tasks;
    if (tasks) {
      Object.keys(tasks).forEach(function (task) {
        divshot[command][task] = handler(command + ':' + task);
      });
    }
  });

  function handler (command) {
    return function () {
      var args = [command]; // Set our command in our args
      var options = {}; // Defaults to no options
      var callback = function () {};
      
      // Only a callback provided
      if (arguments.length === 1) callback = arguments[0];
      
      // args or options and callback provided
      if (arguments.length === 2) {
        if (typeof arguments[0] === 'object') options = arguments[0];
        else args = args.concat([arguments[0]]);
        
        callback = arguments[1];
      }
      
      // args and/or options and callback provided
      if (arguments.length > 2) {
        var args = args.concat([].slice.call(arguments, 0));
        
        callback = args.pop();
        options = args.pop();
        if (typeof options !== 'object') {
          args.push(options);
          options = {};
        }
      }
      
      options._ = args;
      options.debug = (options.debug !== undefined) ? options.debug : false; // Don't print to stdout when using programmatically
      divshot(divshot._command(options), callback);
    }
  }
};