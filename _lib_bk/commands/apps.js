var format = require('chalk');
var _ = require('lodash');

module.exports = function (cli) {
  cli.command('apps')
    .description('list your Divshot apps')
    .before('authenticate')
    .handler(function (done) {
      cli.api.apps.list(function (err, apps) {
        cli.log();
              
        if (apps && apps.error === 'invalid_token') return done(cli.errors.INVALID_TOKEN);
        if (apps && apps.error) return done(apps.error);
        if (!apps || !apps.self) return done(cli.errors.DEFAULT);
        
        cli.log(format.yellow('  Your apps\n'));
        
        printApps(apps.self);
        printOrgApps(apps);
        
        done(err, apps);
      });
    });
  
  function printOrgApps (apps) {
    _(apps)
      .keys()
      .filter(function (name) {
        return name.split(':')[0] === 'org';
      })
      .each(printOrgTitle);
      
    function printOrgTitle (name) {
      var type = name.split(':')[0]
      var orgName = name.split(':')[1]
      
      cli.log();
      cli.log(format.yellow('  ' + orgName + ' apps'));
      cli.log();
      
      printEachOrgApp(apps[name]);
    }
  }
  
  function printEachOrgApp (orgApps) {
    if (!orgApps.length) return cli.log('  (no apps)');
    printApps(orgApps);
  }
  
  function printApps (apps) {
    _(apps)
      .map(function (app) {
        return '  ' + (app.name || app.architect.filename);
      })
      .sortBy()
      .each(cli.log.bind(cli));
  }
};