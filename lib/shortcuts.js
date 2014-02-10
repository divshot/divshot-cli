var _ = require('lodash');

module.exports = function (cli) {
  var methods = {};
  
  _(cli._commands).keys().each(function (commandName) {
    // Set up command shortcuts
    var command = cli._commands[commandName];
    methods[commandName] = handler(command);
    
    // Set up command task shortcuts
    _(command._tasks).keys().each(function (taskName) {
      var task = command._tasks[taskName];
      methods[commandName][taskName] = handler(task);
    });
  });
  
  function handler (command) {
    return function () {
      var originalCallback;
      var debug;
      var args = _.toArray(arguments);
      
      if (typeof args[args.length - 1] === 'object') debug = args.pop();
      
      originalCallback = args.pop(); // Track the original callback
      
      cli.debug = !!debug; // Don't output to stdout
      
      // Turn stdout back on
      args.push(function () {
        cli.debug = true;
        originalCallback.apply(null, _.toArray(arguments));
      });
      
      command._action.fn.apply(command, args);
    };
  }
  
  return methods;
};