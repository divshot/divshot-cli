var path = require('path');
var _ = require('lodash');
var request = require('request');
var writeStreamP = require('writestreamp');

module.exports = function (cli) {
  cli.command('pull <> <>', 'download <> <>')
    .before('authenticate')
    .description('download files from the given environment')
    .handler(function (environment, targetDir, done) {
      if (!environment) return done(cli.errors.MISSING_ENVIRONMENT);
      
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
        
        _.each(files, function (filename) {
          var writeFilename = path.join(process.cwd(), targetDir, filename);
          
          request.get(appUrl + filename)
            .pipe(writeStreamP(writeFilename))
            .on('close', function () {
              cli.log('Downloaded ' + filename, {success: true});
              next();
            })
            .on('error', function (err) {
              done(err);
            });
        });
      });
    });
};