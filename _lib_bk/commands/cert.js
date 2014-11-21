var format = require('chalk');
var fs = require('fs');
var resolvePath = require('path').resolve;

var use = 'cert <certfile> <keyfile> [cabundlefile]';
module.exports = function (cli) {
  var command = cli.command(use);
  var config = cli.cwd.getConfig();

  command.before('authenticate', 'isApp');
  command.description('upload an ssl certificate for your app');

  function requirePath(path, name) {
    path = resolvePath(path);
    if(fs.existsSync(path)) return true;
    cli.log(format.red('Could not find the SSL ' + name + ' file at: ' + path));
    return false;
  }

  command.handler(function (certificateFile, keyFile, cabundleFile, done) {
    if(!(certificateFile && keyFile)) {
      cli.log(format.red('To upload a certificate, you must provide poth the certificate and file paths.'));
      return done(use);
    }

    var requireCabundle = !!cabundleFile;

    //console.log(requirePath(certificateFile, 'Certificate'),requirePath(keyFile, 'Key'), (!requireCabundle || requirePath(cabundleFile, 'CA Bundle')))
    var hasCert = requirePath(certificateFile, 'Certificate');
    var hasKey = requirePath(keyFile, 'Key');
    var hasCabundle = (!requireCabundle || requirePath(cabundleFile, 'CA Bundle'));

    if(!(hasCert && hasKey && hasCabundle)) {
      return done('Missing files.');
    }

    var appApi = cli.api.apps.id(config.name);
    var url =  appApi.url() + '/ssl';
    var payload = {
      ssl_cert: fs.readFileSync(certificateFile).toString(),
      ssl_key: fs.readFileSync(keyFile).toString()
    };
    if (requireCabundle) {
      payload.ssl_bundle = fs.readFileSync(cabundleFile).toString();
    }
    cli.log("Uploading certificate...");
    appApi.http.request(url, 'PUT', {form: payload}, function(err, response) {
      if(err) {
        done(err);
      }
      else {
        if (response.message) {
          done(response.message);
        }
        else {
          cli.log("Uploaded your SSL certificate.", {success:true});
        }
      }
    });
  });
};
