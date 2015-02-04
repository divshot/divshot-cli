var fs = require('fs');
var resolvePath = require('path').resolve;

var format = require('chalk');

var use = 'cert <certfile> <keyfile> [cabundlefile]';

module.exports = function (cli) {
  
  var command = cli.command(use);
  var config = cli.cwd.getConfig();

  command.before('authenticate', 'isApp');
  command.description('upload an ssl certificate for your app');

  command.handler(function (certificateFile, keyFile, cabundleFile, done) {
    
    if(!(certificateFile && keyFile)) {
      cli.log();
      return done('To upload a certificate, you must provide both the certificate and file paths.\n\n Example: ' + format.bold(use));
    }

    var requireCabundle = !!cabundleFile;
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
      
      cli.log();
      
      if (err) {
        return done(err.message);
      }
      
      if (response.statusCode == 400) {
        return done(cli.errors.INVALID_CERT);
      }
      
      if (response.statusCode == 401) {
        return done(cli.errors.NOT_ADMIN);
      }
      
      if (response.statusCode >= 400) {
        return done(cli.errors.APP_NOT_PRODUCTION);
      }
      
      if (response.message) {
        return done(response.message);
      }
      
      cli.log("SSL certificate uploaded.", {success:true});
      cli.log();
    });
  });

  function requirePath(path, name) {
    
    path = resolvePath(path);
    
    if(fs.existsSync(path)) {
      return true;
    }
    
    cli.log(format.red('Could not find the SSL ' + name + ' file at: ' + path));
    
    return false;
  }
};
