var format = require('chalk');

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
        
        cli.log(format.yellow('  Your Divshot apps\n'));
        
        apps.self.forEach(function (app) {
          cli.log('  ' + app.name);
        });
        
        for (group in apps) {
          if (group === 'self' || apps[group].length === 0) { continue; }
          if (!apps[group]) { continue; }
          
          cli.log('\n' + format.yellow('  ' + group.replace('org:', '') + ' Divshot apps \n'));
          
          apps[group].self.forEach(function (app) {
            cli.log('  ' + app.name);
          });
        }
        
        done(err, apps);
      });
    });
};