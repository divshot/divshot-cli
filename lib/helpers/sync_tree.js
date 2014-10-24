/*

# SyncTree

This module exports a function that accepts a single argument `Options`

  * clientOptions: see [AWS.Config](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property)
  * retryOption: see [Retry](https://github.com/tim-kos/node-retry) for options documentation
  * bucket: name of the S3 bucket to upload files to.
  * directory: path to local system directory of files to synchronize with bucket
  * prefix: prefix location in S3 bucket to sync files to. (In practice this is the Application ID)

This function uses the `merkle-dir` module to get a hash representing the directory structure.

Individual files are hashed by their contents, and directories are hashed by the entire contents contained within.

Hash is a SHA256 hexdigest.

SyncTree walks this tree and employs the following algorithm to syncronize files to S3.

    tree = merkle-dir of <director>
    for item in tree.children
      HEAD <prefix>/<sha256>
      IF 200
        continue with next item
      ELSE IF directory?
        upload 0-byte file to <prefix>/<sha256>
        recurse with directory children
      ELSE IF file?
        upload file contents to <prefix>/<sha256>

This strategy is influenced by git. Handily, if a syncronization is requested with no changes to a directory,
or for a directory/file that has been reverted to a previously syncronized state, no content need be uploaded.

This algorithm requires a a GET request per item in the directory. A local cache has been added.

A directory <var dbRoot = '.divshot-cache/deploy'>, is used as a simple cache database.

Before issuing a HEAD request to check for existance of an object, the cache is consulted.

If the object is not recorded in the cache, but is confirmed to exist by the HEAD request,
it is recorded in the cache.

After writing objects to S3, an item is recorded in the cache.

The worst case scenario is that the cache is empty and a new developer would need to issue
a GET request for each item in the directory. (In practice this worst case would probably not occur unless
an item in every sub directory had been changed.)

The worst case scenario could be mitigated by copying the cache folder from one machine to another.

# Events

the SyncTree function emits these events:

    sync.on('inodecount', function(count) {
      // count is the total number of items in the directory
    });
  
    sync.on('notfound', function(path, hash) {
      // when an item is not uploaded/in cache
    });
  
    sync.on('found', function(path, hash, count) {
      // when an item has been uploaded/found in cache
      // count is the number of items the path represents
      // it is 1 for a file, and the total number of children
      // for a directory
    });
  
    sync.on('cachesuccess', function(path, hash, count) {
      // when an item has been added to the cache, count is
      // same as in 'found' event
    });
  
    sync.on('uploadstart', function(path, hash) {
      // at the start of an upload
    });
  
    sync.on('uploadsuccess', function(path, hash) {
      // at the success of an upload
    });
  
    sync.on('uploadfailure', function(error) {
      // when an upload fails for any reason
    });
  
    sync.on('retry', function(error) {
      // when the entire algorithm will be retried
    });
  
    sync.on('error', function(error) {
      // when the retries have been exhausted
    });
*/

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

// Splits keys for placement in the cache database.
// A key 'c24449a459ff989b3318a2e0e4baf8183e2942f5585045d8df3a597d572c47fe'
// would be split into: c2/44/49/a459ff989b3318a2e0e4baf8183e2942f5585045d8df3a597d572c47fe
function splitKey(key) {
  return key.split(/(..)(..)(..)(.+)/).splice(1, 4).join('/');
}

// Writes an item into the cache. Key is the full sha256 sum.
function cacheWrite(key, callback) {
  var dir = path.join(dbRoot, path.dirname(splitKey(key)));
  mkdirp(dir, function(error) {
    if(error) callback(error);
    touch(path.join(dbRoot, splitKey(key)), {}, callback);
  });
}

// reads from the cache, knowing how to split the key into subdirectories
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

// We use pooling to limit how many concurrent requests can be running at any given time.
// S3 is flaky with connections.
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

// Checking whether an object as been uploaded yet. If it is found, it's existance is
// recorded in the cache.
headObject = pool(10, function(emitter, bucket, key, callback) {
  s3Client.headObject({Bucket: bucket, Key: key}, function(error, data) {
    if (error && (error.statusCode == 404 || error.statusCode == 403)) {
      emitter.emit('notfound');
    }
    else if (error) {
      emitter.emit('error', error);
    }
    else {
      cacheWrite(key.split('/')[1], function() {});
      emitter.emit('found');
    }
    callback()
  });
});

// checks if an object is in cache, and failing that, in S3
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

// Another pool to write objects to S3
var putObject = pool(10, function(emitter, bucket, key, body, callback) {
  s3Client.putObject({Bucket:bucket, Key:key, Body:body}, function(error, data) {
    if (error) {
      emitter.emit('error', error);
    }
    else {
      cacheWrite(key.split('/')[1], function() {});
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

// meat of the syncronization control flow
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

