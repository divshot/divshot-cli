var fs = require('fs');
var bundleFiles = require('../helpers/bundle_files');
var path = require('path');

module.exports = function(cli) {
  var command = cli.command('dump');
  command.description('dump a .tar.gz of your project as it would be uploaded. (useful for diagnostics)');
  command.secret(true);
  command.handler(function(environment, done) {
    var config = cli.cwd.getConfig();
    // var appConfigRootPath = (config.root === '/') ? './' : config.root;
    // var appRootDir = path.resolve(process.cwd(), appConfigRootPath);

    // if (!fs.existsSync(appRootDir)) return done(cli.errors.DIRECTORY_DOES_NOT_EXIST);

    // var dumpLocation = config.name + '-dump.tar.gz';
    // var dumpStream = fs.createWriteStream(dumpLocation);

    // bundleFiles(appRootDir, config.exclude)
    //   .pipe(dumpStream)
    //   .on('error', function(error) {
    //     done(error);
    //   })
    //   .on('close', function() {
    //     cli.log('Dumped Project to ' + dumpLocation, {success: true});
    //     done();
    //   });

  });
};
