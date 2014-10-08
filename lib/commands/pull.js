var path = require('path');
var _ = require('lodash');
var join = require('join-path');
var request = require('request');
var writeStreamP = require('writestreamp');
var zlib = require('zlib');
var format = require('chalk');

module.exports = function (cli) {
  cli.command('pull <environment>', 'download <environment>')
    .before('authenticate')
    .description('download files from the given environment')
    .handler(function (environment, targetDir, done) {
      
      if (!environment) return done(cli.errors.MISSING_ENVIRONMENT);
      
      cli.log();
      cli.log('Pulling current files from ' + environment);
      
      targetDir = targetDir || './';
      
      cli.commands.files(environment, function (err, files) {
        
        if (err) return done(err);
        
        var appName = cli.cwd.getConfig().name;
        var appUrl = 'http://' + environment + '.' + appName + '.divshot.io';
        
        cli.log();
        
        var next = _.after(files.length, function () {
          
          cli.log();
          cli.log('All files downloaded', {success: true});
          done();
        });
        
        // TODO:
        // Right now, these files are just proxied from the live site.
        // Maybe we should proxy directly from remote store.
        // 
        // Files for non-hashed builds are stored at <build-id>/<filename>
        // Files for hashed builds are stoerd at <hash-id>/<filename>
        // 
        
        _.each(files, function (filename) {
          
          var writeFilename = join(process.cwd(), targetDir, filename);
          
          request.get(join(appUrl, filename))
            .on('response', function (res) {
              
              var responder = res;
              
              if (res.headers['content-encoding'] === 'gzip') {
                responder = res.pipe(zlib.createGunzip())
              }
              
              responder
                .pipe(writeStreamP(writeFilename, {
                  encoding: 'buffer'
                }))
                .on('close', function () {
                  
                  cli.log('Downloaded ' + filename, {success: true});
                  next();
                })
                .on('error', function (err) {
                  
                  done(err);
                });
            })
            .on('error', function (err) {
              
              done(cli.errors.SERVER_NOT_AVAILABLE + ' with error: \n' + format.bold(err.message));
            });
        });
      });
    });
};