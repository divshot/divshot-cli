var fs = require('fs-extra');
var exitHook = require('exit-hook');

var OUTPUT_FILE = 'divshot-debug.log';

module.exports = function (emitter) {
  
  fs.removeSync(OUTPUT_FILE);
  
  var requests = [];
  var successes = [];
  var errors = [];
  
  // NOTE: do we handle non-http errors????
  // 
  // var writeError = cli.error.bind(cli);
  //
  // Overwrite cli error method to catch non-http errors
  // cli.error = function (msg) {
    
  //   if (msg) {
  //     errors.push({
  //       error: msg
  //     });
  //   }
    
  //   writeError(msg);
  // };
  
  emitter.on('request', function (data) {
    
    requests.push(data);
  });
  
  emitter.on('request:success', function (response) {
    
    successes.push(response);
  });
  
  emitter.on('request:error', function (err) {
    
    errors.push(err);
  });

  exitHook(function () {
    
    if (!errors.length) {
      return;
    }
    
    var output = '';
    
    // Set up debug file output
    requests.forEach(function (req) {
      
      if (req.error && typeof req.error === 'object') {
        output += JSON.stringify(req.error);
        return;
      }
      
      if (req.error) {
        output += req.error;
        return;
      }
      
      if (req.response.body && typeof req.response.body === 'object') {
        output += JSON.stringify(req.response.body);
        return;
      }
      
      if (req.response.body) {
        output += req.response.body;
      }
    });
    
    // Write errors to debug log file
    fs.outputFileSync(OUTPUT_FILE, output);
  });
};