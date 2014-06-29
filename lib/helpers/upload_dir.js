var async = require('async');
var globSync = require('glob').sync;
var fs = require('fs');
var retry = require('retry');
var clone = require('clone');

/* Events emitted:
  
  - uploadstart ({path, attempt})

    When any file upload starts

  - uploaderror ({path, attempt})
    
    When any file upload fails and will be retried.

  - uploadsuccess ({path, progress, total})

    When any file is successfully uploaded.

  - error (error)

    When uploads have failed and should be stopped
    (probably because retries have been exhausted)

  - success ()

    We're done, yah!
*/

module.exports = uploadDir = function(clientOptions, putOptions, directory) {
  var emitter = new (require('events').EventEmitter);
  var AWS = require('aws-sdk');
  AWS.config = new AWS.Config(clientOptions);
  var s3 = new AWS.S3(clientOptions);
  var files = globSync(directory + "**");


  async.eachLimit(files, 50, function(file, callback) {
    var operation = retry.operation({
      retries: 5,
      factor: 3,
      minTimeout: 1 * 100,
      maxTimeout: 5 * 100,
      randomize: true,
    });
    var progress = 0;

    operation.attempt(function(currentAttempt) {
      fs.stat(file, function(error, stat) {
        if (error) { return operation.retry(error); }

        if (stat.isDirectory()) {
          progress += 1;
          emitter.emit('uploadsuccess', {path: file, progress: progress, total:files.length});
          return callback();
        }

        var options = clone(putOptions);
        options.Body = fs.createReadStream(file);
        options.Key = file.replace(directory, '');

        emitter.emit('uploadstart', {path: file, attempt: currentAttempt});
        s3.putObject(options, function(error, data) {
          if (operation.retry(error)) {
            emitter.emit('uploaderror', {path: file, attempt: currentAttempt});
            return;
          }
          else {
            progress += 1;
            if (!error) {
              emitter.emit('uploadsuccess', {path: file, progress: progress, total:files.length});
            }
            callback(error ? operation.mainError() : null);
          }
        });
      });
    });
  }, function(error) {
    if(error) {
      emitter.emit('error', error);
    }
    else {
      emitter.emit('success');
    }
  });

  return emitter;
};