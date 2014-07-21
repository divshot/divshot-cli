var EventEmitter = require('events').EventEmitter;
var merkle = require('merkle-dir');
var async = require('async');
var retry = require('retry');
var AWS = require('aws-sdk');
var s3Client;
var fs = require('graceful-fs');
var path = require('path');
var touch = require('touch');
var mkdirp = require('mkdirp');
var dbRoot = '.divshot-cache/deploy';
var slash = require('slash');
var headObject, putObject;

function splitKey(key) {
  return key.split(/(..)(..)(..)(.+)/).splice(1, 4).join('/');
}

function cacheWrite(key, value, callback) {
  var dir = path.join(dbRoot, path.dirname(splitKey(key)));
  mkdirp(dir, function(error) {
    if(error) callback(error);
    touch(path.join(dbRoot, splitKey(key)), {}, callback);
  });
}

function cacheRead(key, callback) {
  fs.stat(path.join(dbRoot, splitKey(key)), function(error, stat) {
    if (error) {
      callback(error, null);
    }
    else {
      callback(null, true);
    }
  });
}

function pool(limit, funktion) {
  var running = 0;
  var queue = [];

  function callback() {
    running -= 1;
    if (running < _pool.limit) {
      task = queue.shift();
      task ? task() : null;
    }
  }

  function _pool () {
    var args = [].splice.call(arguments, 0);
    args.push(callback);

    if (running >= _pool.limit) {
      queue.push(function() {
        funktion.apply(null, args)
      });
    }
    else {
      running += 1;
      funktion.apply(null, args)
    }
  }

  _pool.limit = limit;

  return _pool;
}

headObject = pool(10, function(emitter, bucket, key, callback) {
  s3Client.headObject({Bucket: bucket, Key: key}, function(error, data) {
    if (error && (error.statusCode == 404 || error.statusCode == 403)) {
      emitter.emit('notfound');
    }
    else if (error) {
      emitter.emit('error', error);
    }
    else {
      cacheWrite(key.split('/')[1], true, function() {});
      emitter.emit('found');
    }
    callback()
  });
});

function _lookup(bucket, key) {
  var emitter = new EventEmitter();
  cacheRead(key, function(error, value) {
    if(error || !value) {
      headObject(emitter, bucket, key);
    }
    else {
      emitter.emit('found');
    }
  });
  return emitter;
}

var putObject = pool(10, function(emitter, bucket, key, body, callback) {
  s3Client.putObject({Bucket:bucket, Key:key, Body:body}, function(error, data) {
    if (error) {
      emitter.emit('error', error);
    }
    else {
      cacheWrite(key.split('/')[1], true, function() {});
      emitter.emit('written');
    }
    callback();
  });
});

function _write (bucket, key, body) {
  var emitter = new EventEmitter();
  putObject(emitter, bucket, key, body);
  return emitter;
};

function _sync(bucket, prefix, tree, rootDirectory, outerEmitter) {
  var emitter = new EventEmitter();

  var lookup = _lookup(bucket, [prefix,tree.hash].join('/'));
  
  lookup.once('notfound', function() {
    outerEmitter.emit('notfound', tree.path, tree.hash);
    if (tree.tree) {
      async.each(tree.tree, function(tree, callback) {
        var sync = _sync(bucket, prefix, tree, rootDirectory, outerEmitter);
        sync.once('synced', callback);
        sync.once('error', callback);
      }, 
      function(error) {
        if (error) {
          emitter.emit('error', error);
        }
        else {
          outerEmitter.emit('cachestart', tree.path, tree.hash, tree.count);
          var write = _write(bucket, [prefix, tree.hash].join('/'), '');
          write.once('written', function() {
            outerEmitter.emit('cachesuccess', tree.path, tree.hash, tree.count);
            emitter.emit('synced');
          });
          write.once('error', function(error) {
            outerEmitter.emit('cachefailure', tree.path, tree.hash, tree.count, error);
            emitter.emit('error', error);
          });
        }
      });
    }
    else {
      var write = _write(bucket, [prefix, tree.hash].join('/'), fs.createReadStream(path.join(rootDirectory, tree.path)));
      outerEmitter.emit('uploadstart', tree.path, tree.hash, tree.count);
      write.once('written', function() {
        outerEmitter.emit('uploadsuccess', tree.path, tree.hash, tree.count);
        emitter.emit('synced');
      });
      write.once('error', function(error) {
        outerEmitter.emit('uploadfailure', tree.path, tree.hash, tree.count, tree.error);
        emitter.emit('error', error);
      });
    }
  });

  lookup.once('found', function() {
    outerEmitter.emit('found', tree.path, tree.hash, tree.count);
    emitter.emit('synced');
  });

  lookup.once('error', function(error) {
    outerEmitter.emit('lookuperror', tree.path, tree.hash, tree.count, error);
    emitter.emit('error', error);
  });

  return emitter;
}


function countTree (tree) {
  var count = 0;
  if (tree.tree) {
    tree.count = 1;
    tree.tree.forEach(function(subTree) {
      tree.count += countTree(subTree);
      count += countTree(subTree);
    });
  }
  else {
    tree.count = 1;
  }
  return count + 1;
}

function generateFileMap (tree, map) {
  map || (map = {});

  if (tree.tree) {
    tree.tree.forEach(function(subTree) {
      generateFileMap(subTree, map);
    });
  }
  else {
    if (process.platform == "win32") {
      map[slash(tree.path)] = tree.hash;
    }
    else {
      map[tree.path] = tree.hash;
    }
  }
  return map
}

module.exports = function(options) {
  var emitter = new EventEmitter();
  var clientOptions = options.clientOptions;
  var retryOptions = options.retryOptions;
  var bucket = options.bucket;
  var directory = options.directory;
  var prefix = options.prefix;

  AWS.config = new AWS.Config(clientOptions);
  s3Client = new AWS.S3(clientOptions);

  var operation = retry.operation(retryOptions);

  merkle(directory, function(error, tree) {
    if(error) {
      emitter.emit('error', error);
    }
    else {    
      emitter.emit('inodecount', countTree(tree));
      operation.attempt(function(currentAttempt) {
        var sync = _sync(bucket, prefix, tree, directory, emitter);
          
        sync.once('synced', function() {
          emitter.emit('synced', generateFileMap(tree));
        });
        sync.once('error', function(error) {
          if (error && error.retryable && operation.retry(error)) {
            emitter.emit('retry', error);
          }
          else {
            emitter.emit('error', operation.mainError() || error);
          }
        });
      });
    }
  });
  return emitter;
}

